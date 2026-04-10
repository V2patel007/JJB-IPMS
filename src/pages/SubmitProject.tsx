import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, onSnapshot } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from '@/lib/firebase';
import { db, auth, storage, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/AuthGuard';
import { BrickType, ProjectType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  Loader2, 
  BrickWall, 
  MapPin, 
  Building2, 
  User, 
  Calendar,
  Send,
  Image as ImageIcon
} from 'lucide-react';

export default function SubmitProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [brickTypes, setBrickTypes] = useState<BrickType[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    state: '',
    country: 'India',
    projectType: '',
    brickType: '',
    completionStatus: 'Completed',
    completionDate: '',
    builderName: '',
  });

  React.useEffect(() => {
    if (!db) return;
    const unsubBricks = onSnapshot(collection(db, 'brickTypes'), (snap) => {
      setBrickTypes(snap.docs.map(d => ({ id: d.id, ...d.data() } as BrickType)));
    });
    const unsubTypes = onSnapshot(collection(db, 'projectTypes'), (snap) => {
      setProjectTypes(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectType)));
    });
    return () => {
      unsubBricks();
      unsubTypes();
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file as Blob));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PENDING_ADMIN') => {
    e.preventDefault();
    if (!user || !db) return;

    if (!formData.name || !formData.brickType || !formData.projectType || !formData.city || !formData.state || !formData.builderName || images.length === 0) {
      toast.error("Please fill in all required fields and upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      const imageUrls: string[] = [];

      // Upload images if any
      if (storage) {
        for (const image of images) {
          const storageRef = ref(storage, `projects/${Date.now()}_${image.name}`);
          const snapshot = await uploadBytes(storageRef, image);
          const url = await getDownloadURL(snapshot.ref);
          imageUrls.push(url);
        }
      }

      const projectData = {
        name: formData.name,
        description: formData.description,
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
        projectType: formData.projectType,
        brickType: formData.brickType,
        images: imageUrls,
        completionStatus: formData.completionStatus,
        completionDate: formData.completionDate ? new Date(formData.completionDate) : serverTimestamp(),
        builderName: formData.builderName,
        submittedBy: user.uid,
        submittedAt: serverTimestamp(),
        status: status,
        lastUpdatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'projects'), projectData);
      
      toast.success(status === 'DRAFT' ? "Project saved as draft" : "Project submitted for approval");
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
          <h1>Submit New Project</h1>
          <p className="text-gray-500 mt-2 font-medium uppercase text-xs tracking-widest">
            Provide details about the construction project where our bricks were used.
          </p>

      <form className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Basic Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Skyline Residency" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="focus-visible:ring-primary border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Tell us more about the project..." 
                    className="min-h-[120px] focus-visible:ring-primary border-gray-200"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select value={formData.projectType} onValueChange={(v) => setFormData({...formData, projectType: v})}>
                      <SelectTrigger className="focus:ring-primary border-gray-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map(t => (
                          <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brickType">Brick Type *</Label>
                    <Select value={formData.brickType} onValueChange={(v) => setFormData({...formData, brickType: v})}>
                      <SelectTrigger className="focus:ring-primary border-gray-200">
                        <SelectValue placeholder="Select brick" />
                      </SelectTrigger>
                      <SelectContent>
                        {brickTypes.map(t => (
                          <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    placeholder="City" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="focus-visible:ring-primary border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input 
                    id="state" 
                    placeholder="State" 
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="focus-visible:ring-primary border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input 
                    id="country" 
                    placeholder="Country" 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="focus-visible:ring-primary border-gray-200"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Project Images *
                </CardTitle>
                <CardDescription>Upload at least one high-quality photo of the project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-2">Add Image</span>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Meta Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Stakeholders *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="builder">Builder / Architect Name *</Label>
                  <Input 
                    id="builder" 
                    placeholder="Name of the firm" 
                    value={formData.builderName}
                    onChange={(e) => setFormData({...formData, builderName: e.target.value})}
                    className="focus-visible:ring-primary border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Completion Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="date" 
                      type="date" 
                      className="pl-9 focus-visible:ring-primary border-gray-200"
                      value={formData.completionDate}
                      onChange={(e) => setFormData({...formData, completionDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button 
                type="button" 
                onClick={(e) => handleSubmit(e, 'PENDING_ADMIN')} 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark h-12"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit for Approval
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => handleSubmit(e, 'DRAFT')}
                disabled={loading}
                className="w-full h-12"
              >
                Save as Draft
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => navigate('/')}
                disabled={loading}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
