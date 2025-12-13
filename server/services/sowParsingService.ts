import { GoogleGenAI } from "@google/genai";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { 
  DEFAULT_SCOPE_OF_WORK_ITEMS, 
  NEW_CONSTRUCTION_SCOPE_OF_WORK_ITEMS,
  SCOPE_OF_WORK_CATEGORY_NAMES,
  NEW_CONSTRUCTION_CATEGORY_NAMES,
  scopeOfWorkCategoryEnum,
  type ScopeOfWorkCategory 
} from "@shared/schema";

async function parsePDF(buffer: Buffer): Promise<string> {
  const pdfParseMod = await import("pdf-parse");
  const pdfParse = (pdfParseMod as any).default || pdfParseMod;
  const data = await pdfParse(buffer);
  return data.text;
}

export interface ParsedSOWItem {
  category: ScopeOfWorkCategory;
  itemName: string;
  description?: string;
  budgetAmount: number;
  laborCost?: number;
  materialCost?: number;
  quantity?: number;
  unit?: string;
}

export interface SOWParseResult {
  success: boolean;
  items: ParsedSOWItem[];
  totalBudget: number;
  parsingMethod: "template" | "ai";
  warnings: string[];
  errors: string[];
}

const geminiClient = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
  httpOptions: {
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const CATEGORY_MAPPING: Record<string, ScopeOfWorkCategory> = {
  "soft costs": "soft_costs",
  "soft_costs": "soft_costs",
  "pre-construction": "soft_costs",
  "preconstruction": "soft_costs",
  "permits": "soft_costs",
  "architectural": "soft_costs",
  "engineering": "soft_costs",
  "demo": "demo_foundation",
  "demo & removal": "demo_foundation",
  "demolition": "demo_foundation",
  "foundation": "demo_foundation",
  "site work": "demo_foundation",
  "excavation": "demo_foundation",
  "grading": "demo_foundation",
  "framing": "demo_foundation",
  "structural": "demo_foundation",
  "roofing": "demo_foundation",
  "hvac": "hvac_plumbing_electrical",
  "plumbing": "hvac_plumbing_electrical",
  "electrical": "hvac_plumbing_electrical",
  "mep": "hvac_plumbing_electrical",
  "mechanical": "hvac_plumbing_electrical",
  "insulation": "hvac_plumbing_electrical",
  "interior": "interior",
  "interior finishes": "interior",
  "kitchens": "interior",
  "kitchen": "interior",
  "bathrooms": "interior",
  "bathroom": "interior",
  "flooring": "interior",
  "drywall": "interior",
  "paint": "interior",
  "cabinets": "interior",
  "countertops": "interior",
  "appliances": "interior",
  "doors": "interior",
  "trim": "interior",
  "exterior": "exterior",
  "exterior finishes": "exterior",
  "siding": "exterior",
  "landscaping": "exterior",
  "decks": "exterior",
  "fencing": "exterior",
  "garage": "exterior",
  "driveway": "exterior",
  "windows": "exterior",
  "gutters": "exterior",
};

function normalizeCategory(text: string): ScopeOfWorkCategory | null {
  const normalized = text.toLowerCase().trim();
  
  for (const [key, category] of Object.entries(CATEGORY_MAPPING)) {
    if (normalized.includes(key)) {
      return category;
    }
  }
  return null;
}

function parseExcelBuffer(buffer: Buffer): { headers: string[]; rows: string[][] } {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length === 0) {
    return { headers: [], rows: [] };
  }
  
  const headers = jsonData[0].map(h => String(h || "").trim());
  const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ""));
  
  return { headers, rows: rows.map(row => row.map(cell => String(cell || ""))) };
}

async function parseWordDocument(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function parsePDFDocument(buffer: Buffer): Promise<string> {
  return parsePDF(buffer);
}

export async function parseSOWTemplate(buffer: Buffer, fileType: string): Promise<SOWParseResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const items: ParsedSOWItem[] = [];
  
  try {
    if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("xlsx") || fileType.includes("xls")) {
      const { headers, rows } = parseExcelBuffer(buffer);
      
      const categoryColIdx = headers.findIndex(h => 
        h.toLowerCase().includes("category") || h.toLowerCase().includes("section")
      );
      const itemColIdx = headers.findIndex(h => 
        h.toLowerCase().includes("item") || h.toLowerCase().includes("description") || h.toLowerCase().includes("name")
      );
      const budgetColIdx = headers.findIndex(h => 
        h.toLowerCase().includes("budget") || h.toLowerCase().includes("cost") || h.toLowerCase().includes("amount") || h.toLowerCase().includes("total")
      );
      const laborColIdx = headers.findIndex(h => 
        h.toLowerCase().includes("labor")
      );
      const materialColIdx = headers.findIndex(h => 
        h.toLowerCase().includes("material")
      );
      const quantityColIdx = headers.findIndex(h => 
        h.toLowerCase().includes("qty") || h.toLowerCase().includes("quantity")
      );
      const unitColIdx = headers.findIndex(h => 
        h.toLowerCase().includes("unit")
      );
      
      if (itemColIdx === -1 || budgetColIdx === -1) {
        warnings.push("Could not find required columns (item/description and budget/cost). Falling back to AI parsing.");
        return parseSOWWithAI(buffer, fileType);
      }
      
      let currentCategory: ScopeOfWorkCategory = "interior";
      
      for (const row of rows) {
        if (categoryColIdx >= 0 && row[categoryColIdx]) {
          const detectedCategory = normalizeCategory(row[categoryColIdx]);
          if (detectedCategory) {
            currentCategory = detectedCategory;
          }
        }
        
        const itemName = row[itemColIdx]?.trim();
        const budgetStr = row[budgetColIdx]?.replace(/[^0-9.-]/g, "");
        const budgetAmount = parseFloat(budgetStr) || 0;
        
        if (!itemName || budgetAmount <= 0) continue;
        
        const detectedCategory = normalizeCategory(itemName);
        if (detectedCategory) {
          currentCategory = detectedCategory;
        }
        
        const laborStr = laborColIdx >= 0 ? row[laborColIdx]?.replace(/[^0-9.-]/g, "") : "";
        const materialStr = materialColIdx >= 0 ? row[materialColIdx]?.replace(/[^0-9.-]/g, "") : "";
        const quantityStr = quantityColIdx >= 0 ? row[quantityColIdx]?.replace(/[^0-9.-]/g, "") : "";
        
        items.push({
          category: currentCategory,
          itemName,
          budgetAmount,
          laborCost: laborStr ? parseFloat(laborStr) : undefined,
          materialCost: materialStr ? parseFloat(materialStr) : undefined,
          quantity: quantityStr ? parseFloat(quantityStr) : undefined,
          unit: unitColIdx >= 0 ? row[unitColIdx]?.trim() : undefined,
        });
      }
      
      if (items.length === 0) {
        warnings.push("No valid items found in spreadsheet. Falling back to AI parsing.");
        return parseSOWWithAI(buffer, fileType);
      }
      
      return {
        success: true,
        items,
        totalBudget: items.reduce((sum, item) => sum + item.budgetAmount, 0),
        parsingMethod: "template",
        warnings,
        errors,
      };
    }
    
    return parseSOWWithAI(buffer, fileType);
  } catch (error) {
    errors.push(`Template parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return parseSOWWithAI(buffer, fileType);
  }
}

export async function parseSOWWithAI(buffer: Buffer, fileType: string): Promise<SOWParseResult> {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  try {
    let textContent = "";
    
    if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("xlsx") || fileType.includes("xls")) {
      const { headers, rows } = parseExcelBuffer(buffer);
      textContent = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
    } else if (fileType.includes("pdf")) {
      textContent = await parsePDFDocument(buffer);
    } else if (fileType.includes("word") || fileType.includes("docx") || fileType.includes("doc")) {
      textContent = await parseWordDocument(buffer);
    } else {
      textContent = buffer.toString("utf-8");
    }
    
    if (textContent.length < 10) {
      errors.push("Document appears to be empty or could not be read");
      return { success: false, items: [], totalBudget: 0, parsingMethod: "ai", warnings, errors };
    }
    
    const prompt = `You are a construction scope of work parser. Parse the following document and extract line items.

For each item, determine:
1. category: One of these exact values: "soft_costs", "demo_foundation", "hvac_plumbing_electrical", "interior", "exterior"
2. itemName: The name/description of the work item
3. budgetAmount: The total cost (number, no currency symbols)
4. laborCost: Labor cost if listed separately (optional)
5. materialCost: Material cost if listed separately (optional)
6. quantity: Quantity if specified (optional)
7. unit: Unit of measurement if specified (optional)

Category Guidelines:
- soft_costs: Permits, architectural, engineering, insurance, inspections, surveys, design
- demo_foundation: Demolition, site prep, excavation, foundation, framing, roofing, structural
- hvac_plumbing_electrical: HVAC, plumbing, electrical, insulation, mechanical systems
- interior: Kitchens, bathrooms, flooring, drywall, paint, cabinets, countertops, appliances, doors, trim
- exterior: Siding, windows, landscaping, decks, fencing, garage, driveway, gutters

Return ONLY a valid JSON array of objects. No markdown, no explanation. Example:
[{"category": "interior", "itemName": "Kitchen Cabinets", "budgetAmount": 5000, "laborCost": 2000, "materialCost": 3000}]

Document content:
${textContent.slice(0, 15000)}`;

    const response = await geminiClient.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    
    const responseText = response.text || "";
    
    let jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      jsonMatch = responseText.match(/```json?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (!jsonMatch) {
      errors.push("AI could not extract structured data from document");
      return { success: false, items: [], totalBudget: 0, parsingMethod: "ai", warnings, errors };
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(parsed)) {
      errors.push("AI response was not an array of items");
      return { success: false, items: [], totalBudget: 0, parsingMethod: "ai", warnings, errors };
    }
    
    const items: ParsedSOWItem[] = parsed
      .filter((item: any) => item.itemName && item.budgetAmount > 0)
      .map((item: any) => ({
        category: normalizeCategory(item.category) || "interior",
        itemName: String(item.itemName),
        description: item.description ? String(item.description) : undefined,
        budgetAmount: Number(item.budgetAmount) || 0,
        laborCost: item.laborCost ? Number(item.laborCost) : undefined,
        materialCost: item.materialCost ? Number(item.materialCost) : undefined,
        quantity: item.quantity ? Number(item.quantity) : undefined,
        unit: item.unit ? String(item.unit) : undefined,
      }));
    
    if (items.length === 0) {
      errors.push("No valid items extracted from document");
      return { success: false, items: [], totalBudget: 0, parsingMethod: "ai", warnings, errors };
    }
    
    return {
      success: true,
      items,
      totalBudget: items.reduce((sum, item) => sum + item.budgetAmount, 0),
      parsingMethod: "ai",
      warnings,
      errors,
    };
  } catch (error) {
    errors.push(`AI parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { success: false, items: [], totalBudget: 0, parsingMethod: "ai", warnings, errors };
  }
}

export function getSOWTemplate(loanType: "fix_flip" | "new_construction"): typeof DEFAULT_SCOPE_OF_WORK_ITEMS {
  return loanType === "new_construction" ? NEW_CONSTRUCTION_SCOPE_OF_WORK_ITEMS : DEFAULT_SCOPE_OF_WORK_ITEMS;
}

export function getCategoryNames(loanType: "fix_flip" | "new_construction"): typeof SCOPE_OF_WORK_CATEGORY_NAMES {
  return loanType === "new_construction" ? NEW_CONSTRUCTION_CATEGORY_NAMES : SCOPE_OF_WORK_CATEGORY_NAMES;
}
