import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { BrickType, ProjectType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  BrickWall, 
  Building2, 
  Settings2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function Configuration() {
  const [brickTypes, setBrickTypes] = useState<BrickType[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newBrick, setNewBrick] = useState({ name: '', description: '' });
  const [newType, setNewType] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!db) return;

    const unsubBricks = onSnapshot(collection(db, 'brickTypes'), (snap) => {
      setBrickTypes(snap.docs.map(d => ({ id: d.id, ...d.data() } as BrickType)));
    });

    const unsubTypes = onSnapshot(collection(db, 'projectTypes'), (snap) => {
      setProjectTypes(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectType)));
      setLoading(false);
    });

    return () => {
      unsubBricks();
      unsubTypes();
    };
  }, []);

  const handleAddBrick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrick.name) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'brickTypes'), newBrick);
      setNewBrick({ name: '', description: '' });
      toast.success("Brick type added successfully");
    } catch (error) {
      toast.error("Failed to add brick type");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brick type?')) return;
    try {
      await deleteDoc(doc(db, 'brickTypes', id));
      toast.success("Brick type deleted");
    } catch (error) {
      toast.error("Failed to delete brick type");
    }
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.name) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'projectTypes'), newType);
      setNewType({ name: '' });
      toast.success("Project type added successfully");
    } catch (error) {
      toast.error("Failed to add project type");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project type?')) return;
    try {
      await deleteDoc(doc(db, 'projectTypes', id));
      toast.success("Project type deleted");
    } catch (error) {
      toast.error("Failed to delete project type");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2">
          <Settings2 className="h-8 w-8 text-primary" />
          System Configuration
        </h1>
        <p className="text-gray-500 mt-1 font-medium uppercase text-xs tracking-widest">Manage brick types and project categories used across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Brick Types Management */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrickWall className="h-5 w-5 text-orange-600" />
                Brick Types
              </CardTitle>
              <CardDescription>Add or remove brick varieties available for projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddBrick} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <Label htmlFor="brickName">Brick Name</Label>
                  <Input 
                    id="brickName" 
                    placeholder="e.g. Terracotta Red" 
                    value={newBrick.name}
                    onChange={(e) => setNewBrick({...newBrick, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brickDesc">Description (Optional)</Label>
                  <Textarea 
                    id="brickDesc" 
                    placeholder="Brief details about this brick..." 
                    value={newBrick.description}
                    onChange={(e) => setNewBrick({...newBrick, description: e.target.value})}
                  />
                </div>
                <Button type="submit" disabled={submitting || !newBrick.name} className="w-full bg-orange-600 hover:bg-orange-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Add Brick Type
                </Button>
              </form>

              <div className="space-y-3">
                {brickTypes.map((brick) => (
                  <motion.div 
                    key={brick.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{brick.name}</p>
                      {brick.description && <p className="text-xs text-slate-500 line-clamp-1">{brick.description}</p>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteBrick(brick.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Types Management */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Project Types
              </CardTitle>
              <CardDescription>Manage project categories like Residential, Commercial, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddType} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <Label htmlFor="typeName">Type Name</Label>
                  <Input 
                    id="typeName" 
                    placeholder="e.g. Infrastructure" 
                    value={newType.name}
                    onChange={(e) => setNewType({...newType, name: e.target.value})}
                  />
                </div>
                <Button type="submit" disabled={submitting || !newType.name} className="w-full bg-blue-600 hover:bg-blue-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Add Project Type
                </Button>
              </form>

              <div className="space-y-3">
                {projectTypes.map((type) => (
                  <motion.div 
                    key={type.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <p className="font-semibold text-slate-900">{type.name}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteType(type.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
