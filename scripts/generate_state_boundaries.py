import requests
import json
import re

def slugify(name):
    """Convert state name to slug format"""
    return name.lower().replace(' ', '-')

def main():
    url = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
    
    print("Fetching US states GeoJSON...")
    response = requests.get(url)
    data = response.json()
    
    print(f"Found {len(data['features'])} states")
    
    output_lines = []
    output_lines.append('export interface StateBoundary {')
    output_lines.append('  coordinates: Array<{ lat: number; lng: number }>;')
    output_lines.append('}')
    output_lines.append('')
    output_lines.append('export const STATE_BOUNDARIES: Record<string, StateBoundary> = {')
    
    for feature in data['features']:
        name = feature['properties']['name']
        slug = slugify(name)
        geometry = feature['geometry']
        
        if geometry['type'] == 'Polygon':
            coords = geometry['coordinates'][0]
        elif geometry['type'] == 'MultiPolygon':
            all_polygons = geometry['coordinates']
            largest = max(all_polygons, key=lambda p: len(p[0]))
            coords = largest[0]
        else:
            print(f"Unknown geometry type for {name}: {geometry['type']}")
            continue
        
        simplified_coords = coords[::max(1, len(coords) // 50)]
        if simplified_coords[-1] != coords[-1]:
            simplified_coords.append(coords[-1])
        
        needs_quotes = '-' in slug or slug in ['new', 'of']
        if needs_quotes:
            output_lines.append(f'  "{slug}": {{')
        else:
            output_lines.append(f'  {slug}: {{')
        
        output_lines.append('    coordinates: [')
        
        for lng, lat in simplified_coords:
            output_lines.append(f'      {{ lat: {lat}, lng: {lng} }},')
        
        output_lines.append('    ],')
        output_lines.append('  },')
    
    output_lines.append('};')
    output_lines.append('')
    output_lines.append('export function getStateBoundary(stateSlug: string): StateBoundary | null {')
    output_lines.append('  return STATE_BOUNDARIES[stateSlug] || null;')
    output_lines.append('}')
    output_lines.append('')
    output_lines.append('export function createMaskPolygon(stateBoundary: StateBoundary): Array<Array<{ lat: number; lng: number }>> {')
    output_lines.append('  const worldBounds = [')
    output_lines.append('    { lat: 85, lng: -180 },')
    output_lines.append('    { lat: 85, lng: 180 },')
    output_lines.append('    { lat: -85, lng: 180 },')
    output_lines.append('    { lat: -85, lng: -180 },')
    output_lines.append('    { lat: 85, lng: -180 },')
    output_lines.append('  ];')
    output_lines.append('')
    output_lines.append('  const stateHole = [...stateBoundary.coordinates].reverse();')
    output_lines.append('')
    output_lines.append('  return [worldBounds, stateHole];')
    output_lines.append('}')
    
    output_path = 'client/src/data/stateBoundaries.ts'
    with open(output_path, 'w') as f:
        f.write('\n'.join(output_lines))
    
    print(f"Generated {output_path} with {len(data['features'])} states")

if __name__ == '__main__':
    main()
