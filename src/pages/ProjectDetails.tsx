import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Building2, 
  BrickWall, 
  Calendar, 
  User, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      if (!id || !db) return;
      try {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as Project);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Clock className="h-8 w-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900">Project not found</h2>
        <Button onClick={() => navigate('/portal')} variant="link" className="mt-4">
          Back to Portal
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="outline">Draft</Badge>;
      case 'PENDING_ADMIN': return <Badge variant="secondary" className="bg-primary/10 text-primary">Admin Review</Badge>;
      case 'PENDING_SUPERADMIN': return <Badge variant="secondary" className="bg-primary/10 text-primary">Superadmin Review</Badge>;
      case 'PUBLISHED': return <Badge variant="secondary" className="bg-green-100 text-green-700">Published</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="group text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(project.status)}
              <Badge variant="outline" className="bg-gray-50">{project.projectType}</Badge>
            </div>
            <h1>{project.name}</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="text-lg">{project.location.city}, {project.location.state}, {project.location.country}</span>
            </div>
          </motion.div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 gap-4">
            {project.images?.map((url, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
              >
                <img 
                  src={url} 
                  alt={`${project.name} - ${i + 1}`} 
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>

          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {project.description || 'No description provided for this project.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Project Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BrickWall className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brick Type</p>
                  <p className="font-bold text-gray-900 uppercase">{project.brickType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completion Date</p>
                  <p className="font-bold text-gray-900 uppercase">
                    {project.completionDate ? format(project.completionDate.toDate(), 'MMMM yyyy') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Builder / Architect</p>
                  <p className="font-bold text-gray-900 uppercase">{project.builderName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Type</p>
                  <p className="font-bold text-gray-900 uppercase">{project.projectType}</p>
                </div>
              </div>

              {project.status === 'REJECTED' && (project.adminFeedback || project.superadminFeedback) && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-2">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Rejection Feedback
                    </div>
                    <p className="text-sm text-red-600 italic">
                      "{project.adminFeedback || project.superadminFeedback}"
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2 group">
        <div className="bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Get Quotation
        </div>
        <Button 
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 flex items-center justify-center p-0 transition-transform hover:scale-110"
          onClick={() => window.open('/quotation.html', '_blank')}
        >
          <FileText className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
