import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthGuard';
import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ArrowRight,
  BrickWall,
  Building2,
  MapPin,
  PlusCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) return;

    // Fetch user's projects
    const q = query(
      collection(db, 'projects'),
      where('submittedBy', '==', user.uid),
      orderBy('lastUpdatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = [
    { 
      label: 'Drafts', 
      value: projects.filter(p => p.status === 'DRAFT').length, 
      icon: Clock, 
      color: 'text-slate-500', 
      bg: 'bg-slate-100' 
    },
    { 
      label: 'Pending Approval', 
      value: projects.filter(p => ['PENDING_ADMIN', 'PENDING_SUPERADMIN'].includes(p.status)).length, 
      icon: Send, 
      color: 'text-orange-500', 
      bg: 'bg-orange-100' 
    },
    { 
      label: 'Published', 
      value: projects.filter(p => p.status === 'PUBLISHED').length, 
      icon: CheckCircle2, 
      color: 'text-green-500', 
      bg: 'bg-green-100' 
    },
    { 
      label: 'Rejected', 
      value: projects.filter(p => p.status === 'REJECTED').length, 
      icon: AlertCircle, 
      color: 'text-red-500', 
      bg: 'bg-red-100' 
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="outline">Draft</Badge>;
      case 'PENDING_ADMIN': return <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">Admin Review</Badge>;
      case 'PENDING_SUPERADMIN': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Superadmin Review</Badge>;
      case 'PUBLISHED': return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Published</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1>Welcome back, {user?.displayName}</h1>
        <p className="text-gray-500 mt-1 font-medium uppercase text-xs tracking-widest">Manage your construction projects and track their approval status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">My Recent Projects</h2>
          <Button render={<Link to="/portal" />} nativeButton={false} variant="ghost" size="sm" className="flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden group">
                  <div className="h-32 bg-slate-200 relative overflow-hidden">
                    {project.images?.[0] ? (
                      <img 
                        src={project.images[0]} 
                        alt={project.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.location.city}, {project.location.country}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <BrickWall className="h-4 w-4 text-orange-600" />
                      <span>{project.brickType}</span>
                    </div>
                    {project.status === 'REJECTED' && (
                      <div className="bg-red-50 p-2 rounded text-xs text-red-700 border border-red-100">
                        <strong>Feedback:</strong> {project.adminFeedback || project.superadminFeedback}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="p-12 text-center space-y-4">
              <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <PlusCircle className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">No projects yet</h3>
                <p className="text-slate-500">Submit your first construction project to get started.</p>
              </div>
              <Button render={<Link to="/submit" />} nativeButton={false} className="bg-orange-600 hover:bg-orange-700">
                Submit Project
              </Button>
            </CardContent>
          </Card>
        )}
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
          <PlusCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
