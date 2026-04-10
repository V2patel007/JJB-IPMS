import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from '@/lib/firebase';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MessageSquare, 
  Loader2,
  Building2,
  MapPin,
  User,
  Send
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ApprovalListProps {
  targetStatus: 'PENDING_ADMIN' | 'PENDING_SUPERADMIN';
  nextStatus: 'PENDING_SUPERADMIN' | 'PUBLISHED';
  role: 'ADMIN' | 'SUPERADMIN';
}

export default function ApprovalList({ targetStatus, nextStatus, role }: ApprovalListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'projects'),
      where('status', '==', targetStatus)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetStatus]);

  const handleAction = async (projectId: string, action: 'APPROVE' | 'REJECT') => {
    if (!db) return;
    setActionLoading(true);

    try {
      const projectRef = doc(db, 'projects', projectId);
      const updates: any = {
        status: action === 'APPROVE' ? nextStatus : 'REJECTED',
        lastUpdatedAt: serverTimestamp(),
      };

      if (action === 'REJECT') {
        if (role === 'ADMIN') updates.adminFeedback = feedback;
        else updates.superadminFeedback = feedback;
      }

      await updateDoc(projectRef, updates);
      toast.success(action === 'APPROVE' ? "Project approved" : "Project rejected");
      setIsRejectDialogOpen(false);
      setFeedback('');
      setSelectedProject(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'projects');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>
            {role === 'ADMIN' ? 'Admin Approval' : 'Superadmin Approval'}
          </h1>
          <p className="text-gray-500 mt-1 font-medium uppercase text-xs tracking-widest">
            Review and approve project submissions for the portal.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-sm font-bold bg-orange-100 text-orange-700">
          {projects.length} Pending
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-32 md:h-auto bg-slate-100 relative">
                  {project.images?.[0] ? (
                    <img 
                      src={project.images[0]} 
                      alt={project.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase">{project.projectType}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location.city}, {project.location.country}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {project.builderName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Submitted: {project.submittedAt ? format(project.submittedAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" size="sm" />}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{project.name}</DialogTitle>
                          <DialogDescription>Full project details for review.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-bold text-slate-400 uppercase text-[10px]">Description</p>
                              <p className="mt-1">{project.description || 'No description provided.'}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-400 uppercase text-[10px]">Brick Type</p>
                              <p className="mt-1">{project.brickType}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            {project.images?.map((url, i) => (
                              <img key={i} src={url} alt="Project" className="rounded-lg aspect-video object-cover border" referrerPolicy="no-referrer" />
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction(project.id, 'APPROVE')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Approve
                    </Button>

                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setIsRejectDialogOpen(true);
                      }}
                      disabled={actionLoading}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-12 text-center text-slate-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">All caught up!</p>
            <p>No projects currently waiting for your approval.</p>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
            <DialogDescription>
              Please provide feedback for the user explaining why the project was rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="feedback">Feedback *</Label>
            <Textarea 
              id="feedback" 
              placeholder="e.g. Image quality is low, please re-upload." 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedProject && handleAction(selectedProject.id, 'REJECT')}
              disabled={!feedback || actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
