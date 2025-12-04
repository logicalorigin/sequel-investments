import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  Clock,
  Loader2,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  Download,
  Trash2,
  Send,
  User,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Document, DocumentReview, StaffRole } from "@shared/schema";

interface StaffRoleColors {
  bg: string;
  text: string;
  label: string;
  description: string;
}

const staffRoleColors: Record<StaffRole | string, StaffRoleColors> = {
  account_executive: {
    bg: "bg-primary/20",
    text: "text-primary",
    label: "Account Executive",
    description: "Primary contact for borrowers",
  },
  processor: {
    bg: "bg-accent/20",
    text: "text-accent-foreground",
    label: "Processor",
    description: "Document and file processing",
  },
  underwriter: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    label: "Underwriter",
    description: "Risk assessment and approval",
  },
  management: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    label: "Management",
    description: "Senior oversight",
  },
};

interface DocumentReviewPanelProps {
  document: Document & {
    documentType?: { name: string; description: string } | null;
  };
  onClose?: () => void;
  isAdmin?: boolean;
}

interface ReviewWithUser extends DocumentReview {
  reviewer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
    staffRole: StaffRole | null;
  } | null;
}

interface CommentAttachment {
  id: string;
  commentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedByUserId: string;
  createdAt: string;
}

interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
    staffRole: StaffRole | null;
  } | null;
  attachments?: CommentAttachment[];
}

const reviewActionConfig = {
  approved: {
    icon: CheckCircle2,
    label: "Approve",
    color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    borderColor: "border-green-500",
  },
  rejected: {
    icon: XCircle,
    label: "Reject",
    color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    borderColor: "border-red-500",
  },
  request_changes: {
    icon: RotateCcw,
    label: "Request Changes",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    borderColor: "border-amber-500",
  },
};

const isAuthError = (error: Error | null): boolean => {
  if (!error) return false;
  const msg = error.message || "";
  return msg.includes("401") || msg.includes("403") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("forbidden");
};

export function DocumentReviewPanel({
  document,
  onClose,
  isAdmin = false,
}: DocumentReviewPanelProps) {
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [comment, setComment] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const pendingAttachmentRef = useRef<File | null>(null);

  const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/documents", document.id, "reviews"],
    retry: (failureCount, error: Error) => {
      if (isAuthError(error)) return false;
      return failureCount < 2;
    },
  });

  const { data: comments = [], isLoading: commentsLoading, error: commentsError } = useQuery<DocumentComment[]>({
    queryKey: ["/api/documents", document.id, "comments"],
    retry: (failureCount, error: Error) => {
      if (isAuthError(error)) return false;
      return failureCount < 2;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: { action: string; comment?: string }) => {
      const response = await apiRequest("POST", `/api/documents/${document.id}/reviews`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", document.id, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsReviewDialogOpen(false);
      setSelectedAction("");
      setComment("");
      toast({
        title: "Review submitted",
        description: "Your document review has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [pendingCommentId, setPendingCommentId] = useState<string | null>(null);

  const uploadAttachmentWithFile = async (commentId: string, file: File): Promise<boolean> => {
    setIsUploadingAttachment(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/documents/${document.id}/comments/${commentId}/attachments`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to upload attachment");
      }
      return true;
    } catch {
      toast({
        title: "Attachment upload failed",
        description: "The comment was added but the attachment could not be uploaded. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/documents/${document.id}/comments`, {
        content,
        isInternal: isAdmin,
      });
      return response.json();
    },
    onSuccess: async (newCommentData) => {
      const currentFile = pendingAttachmentRef.current || attachmentFile;
      const hadAttachment = !!currentFile;
      let attachmentSuccess = true;
      
      if (currentFile && newCommentData.id) {
        attachmentSuccess = await uploadAttachmentWithFile(newCommentData.id, currentFile);
        if (!attachmentSuccess) {
          setPendingCommentId(newCommentData.id);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/documents", document.id, "comments"] });
      setNewComment("");
      
      if (attachmentSuccess) {
        setAttachmentFile(null);
        setAttachmentPreview(null);
        setPendingCommentId(null);
        pendingAttachmentRef.current = null;
        toast({
          title: "Comment added",
          description: hadAttachment ? "Your comment and attachment have been posted." : "Your comment has been posted.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const retryAttachmentMutation = useMutation({
    mutationFn: async () => {
      const fileToUpload = pendingAttachmentRef.current || attachmentFile;
      if (!pendingCommentId || !fileToUpload) {
        throw new Error("No file available for retry");
      }
      const success = await uploadAttachmentWithFile(pendingCommentId, fileToUpload);
      if (!success) throw new Error("Upload failed");
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", document.id, "comments"] });
      setAttachmentFile(null);
      setAttachmentPreview(null);
      setPendingCommentId(null);
      pendingAttachmentRef.current = null;
      toast({
        title: "Attachment uploaded",
        description: "Your attachment has been added to the comment.",
      });
    },
  });

  const hasFileForRetry = !!(pendingAttachmentRef.current || attachmentFile);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB.",
          variant: "destructive",
        });
        return;
      }
      setAttachmentFile(file);
      pendingAttachmentRef.current = file;
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setAttachmentPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(null);
      }
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const handleReviewSubmit = () => {
    if (!selectedAction) return;
    reviewMutation.mutate({
      action: selectedAction,
      comment: comment.trim() || undefined,
    });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const docStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
    uploaded: { label: "Uploaded", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300" },
    approved: { label: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
    under_review: { label: "Under Review", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
    if_applicable: { label: "If Applicable", color: "bg-muted text-muted-foreground" },
  };

  const latestReview = reviews[0];
  const status = docStatusConfig[document.status as string] || docStatusConfig.pending;

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                {document.documentType?.name || document.fileName || "Untitled Document"}
              </CardTitle>
              <CardDescription className="mt-1">
                {document.documentType?.description || "Document for review"}
              </CardDescription>
            </div>
            <Badge className={status.color} data-testid="badge-document-status">
              {status.label}
            </Badge>
          </div>

          {document.fileUrl && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                data-testid="button-download-document"
              >
                <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  View Document
                </a>
              </Button>
            </div>
          )}

          {isAdmin && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(reviewActionConfig).map(([action, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    className={`${selectedAction === action ? config.borderColor + " border-2" : ""}`}
                    onClick={() => {
                      setSelectedAction(action);
                      setIsReviewDialogOpen(true);
                    }}
                    data-testid={`button-review-${action}`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 overflow-hidden pt-4">
          <div className="flex flex-col gap-6 h-full">
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Review History
              </h4>
              
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : reviewsError ? (
                <div className="text-center py-6 text-sm">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                  <p className="text-muted-foreground">
                    {isAuthError(reviewsError)
                      ? "You don't have permission to view reviews"
                      : "Unable to load reviews"}
                  </p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No reviews yet
                </div>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3 pr-4">
                    {reviews.map((review) => {
                      const actionConfig = reviewActionConfig[review.action as keyof typeof reviewActionConfig];
                      const staffRole = review.reviewer?.staffRole;
                      const roleConfig = staffRole ? staffRoleColors[staffRole] : null;
                      const Icon = actionConfig?.icon || Eye;
                      
                      return (
                        <div
                          key={review.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                          data-testid={`review-item-${review.id}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={review.reviewer?.profileImageUrl || undefined} />
                            <AvatarFallback
                              className={roleConfig ? `${roleConfig.bg} ${roleConfig.text}` : ""}
                            >
                              {getInitials(review.reviewer?.firstName, review.reviewer?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">
                                {review.reviewer?.firstName || "Staff"} {review.reviewer?.lastName || ""}
                              </span>
                              {roleConfig && (
                                <Badge variant="outline" className={`text-xs ${roleConfig.bg} ${roleConfig.text} border-0`}>
                                  {roleConfig.label}
                                </Badge>
                              )}
                              <Badge className={actionConfig?.color || ""}>
                                <Icon className="h-3 w-3 mr-1" />
                                {actionConfig?.label || review.action}
                              </Badge>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            <Separator />

            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Comments & Discussion
              </h4>

              {commentsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : commentsError ? (
                <div className="text-center py-6 text-sm">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                  <p className="text-muted-foreground">
                    {isAuthError(commentsError)
                      ? "You don't have permission to view comments"
                      : "Unable to load comments"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="flex-1 min-h-[150px] max-h-[300px]">
                  <div className="space-y-3 pr-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        No comments yet
                      </div>
                    ) : (
                      comments.map((comment) => {
                        const staffRole = comment.user?.staffRole;
                        const roleConfig = staffRole ? staffRoleColors[staffRole] : null;
                        
                        return (
                          <div
                            key={comment.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                            data-testid={`comment-item-${comment.id}`}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={comment.user?.profileImageUrl || undefined} />
                              <AvatarFallback
                                className={roleConfig ? `${roleConfig.bg} ${roleConfig.text}` : ""}
                              >
                                {getInitials(comment.user?.firstName, comment.user?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">
                                  {comment.user?.firstName || "User"} {comment.user?.lastName || ""}
                                </span>
                                {roleConfig && (
                                  <Badge variant="outline" className={`text-xs ${roleConfig.bg} ${roleConfig.text} border-0`}>
                                    {roleConfig.label}
                                  </Badge>
                                )}
                                {comment.isInternal && (
                                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-0">
                                    Internal
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                              
                              {comment.attachments && comment.attachments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {comment.attachments.map((attachment) => (
                                    <a
                                      key={attachment.id}
                                      href={attachment.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-muted rounded-md hover:bg-muted/70"
                                    >
                                      {attachment.fileType.startsWith("image/") ? (
                                        <ImageIcon className="h-3 w-3" />
                                      ) : (
                                        <Paperclip className="h-3 w-3" />
                                      )}
                                      <span className="truncate max-w-[100px]">{attachment.fileName}</span>
                                      <span className="text-muted-foreground">
                                        ({formatFileSize(attachment.fileSize)})
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              )}

              <form onSubmit={handleSubmitComment} className="mt-3 space-y-2">
                <div className="relative">
                  <Textarea
                    placeholder={isAdmin ? "Add an internal comment..." : "Add a comment..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] pr-10 resize-none"
                    data-testid="input-new-comment"
                  />
                  <input
                    type="file"
                    id="attachment-input"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="attachment-input"
                    className="absolute right-2 top-2 p-1.5 rounded-md hover:bg-muted cursor-pointer"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </label>
                </div>

                {attachmentFile && (
                  <div className={`flex items-center gap-2 text-sm p-2 rounded-md ${pendingCommentId ? "bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" : "bg-muted/50"}`}>
                    {attachmentPreview ? (
                      <img
                        src={attachmentPreview}
                        alt="Preview"
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{attachmentFile.name}</span>
                      {pendingCommentId && (
                        <span className="text-xs text-amber-700 dark:text-amber-300">
                          Upload failed - click retry to try again
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {formatFileSize(attachmentFile.size)}
                    </span>
                    {pendingCommentId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => retryAttachmentMutation.mutate()}
                        disabled={retryAttachmentMutation.isPending || isUploadingAttachment || !hasFileForRetry}
                        data-testid="button-retry-attachment"
                      >
                        {retryAttachmentMutation.isPending || isUploadingAttachment ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <RotateCcw className="h-3 w-3 mr-1" />
                        )}
                        {hasFileForRetry ? "Retry" : "File Lost"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setAttachmentFile(null);
                        setAttachmentPreview(null);
                        setPendingCommentId(null);
                        pendingAttachmentRef.current = null;
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {isAdmin && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" />
                      Comments marked as internal
                    </div>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || addCommentMutation.isPending || isUploadingAttachment}
                    className="ml-auto"
                    data-testid="button-submit-comment"
                  >
                    {addCommentMutation.isPending || isUploadingAttachment ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isUploadingAttachment ? "Uploading..." : "Send"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction && reviewActionConfig[selectedAction as keyof typeof reviewActionConfig] && (
                <>
                  {(() => {
                    const Icon = reviewActionConfig[selectedAction as keyof typeof reviewActionConfig].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                  {reviewActionConfig[selectedAction as keyof typeof reviewActionConfig].label}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedAction === "approved" && "Approve this document and mark it as complete."}
              {selectedAction === "rejected" && "Reject this document. The borrower will need to upload a new version."}
              {selectedAction === "request_changes" && "Request changes to this document before approval."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Add a comment (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              data-testid="input-review-comment"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReviewDialogOpen(false);
                setSelectedAction("");
                setComment("");
              }}
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewMutation.isPending}
              className={
                selectedAction === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : selectedAction === "rejected"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
              data-testid="button-confirm-review"
            >
              {reviewMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
