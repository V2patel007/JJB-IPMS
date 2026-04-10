import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  BrickWall,
  Calendar,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ProjectPortal() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brickFilter, setBrickFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    if (!db) return;

    // Fetch only published projects for the portal
    const q = query(
      collection(db, 'projects'),
      where('status', '==', 'PUBLISHED'),
      orderBy('lastUpdatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getTime = (val: any) => {
    if (!val) return 0;
    if (typeof val.toMillis === 'function') return val.toMillis();
    if (val instanceof Date) return val.getTime();
    if (typeof val === 'string') return new Date(val).getTime();
    return 0;
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.location.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrick = brickFilter === 'all' || project.brickType === brickFilter;
      const matchesType = typeFilter === 'all' || project.projectType === typeFilter;
      
      return matchesSearch && matchesBrick && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return getTime(b.lastUpdatedAt) - getTime(a.lastUpdatedAt);
        case 'date-asc':
          return getTime(a.lastUpdatedAt) - getTime(b.lastUpdatedAt);
        case 'type-asc':
          return a.projectType.localeCompare(b.projectType);
        case 'brick-asc':
          return a.brickType.localeCompare(b.brickType);
        case 'city-asc':
          return a.location.city.localeCompare(b.location.city);
        default:
          return 0;
      }
    });

  const brickTypes = Array.from(new Set(projects.map(p => p.brickType)));
  const projectTypes = Array.from(new Set(projects.map(p => p.projectType)));

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="flex-1">
          <h1>Project Portal</h1>
          <p className="text-gray-500 mt-2 font-medium">
            A curated selection of architectural excellence.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="SEARCH PROJECTS..." 
              className="pl-10 bg-white border-gray-200 rounded-none h-12 uppercase text-xs tracking-widest font-bold focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={brickFilter} onValueChange={setBrickFilter}>
            <SelectTrigger className="w-[180px] rounded-none h-12 bg-white border-gray-200 uppercase text-[10px] tracking-widest font-black focus:ring-primary">
              <SelectValue placeholder="BRICK TYPE" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-gray-200">
              <SelectItem value="all">ALL BRICKS</SelectItem>
              {brickTypes.map(type => (
                <SelectItem key={type as string} value={type as string}>{(type as string).toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] rounded-none h-12 bg-white border-gray-200 uppercase text-[10px] tracking-widest font-black focus:ring-primary">
              <SelectValue placeholder="PROJECT TYPE" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-gray-200">
              <SelectItem value="all">ALL TYPES</SelectItem>
              {projectTypes.map(type => (
                <SelectItem key={type as string} value={type as string}>{(type as string).toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] rounded-none h-12 bg-white border-gray-200 uppercase text-[10px] tracking-widest font-black focus:ring-primary">
              <SelectValue placeholder="SORT BY" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-gray-200">
              <SelectItem value="date-desc">NEWEST FIRST</SelectItem>
              <SelectItem value="date-asc">OLDEST FIRST</SelectItem>
              <SelectItem value="type-asc">PROJECT TYPE (A-Z)</SelectItem>
              <SelectItem value="brick-asc">BRICK TYPE (A-Z)</SelectItem>
              <SelectItem value="city-asc">CITY (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/project/${project.id}`)}
              className="relative aspect-square overflow-hidden cursor-pointer group"
            >
              <img 
                src={project.images?.[0] || `https://picsum.photos/seed/${project.id}/800/800`} 
                alt={project.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay Gradient - Subtle at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              
              {/* Content Overlay - Bottom Left */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <p className="text-white font-bold text-lg tracking-wider uppercase">
                  {project.projectType}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white border border-gray-100">
          <Search className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-900 uppercase italic">No projects found</h3>
          <p className="text-gray-400 mt-2 text-sm font-medium uppercase tracking-widest">Try adjusting your filters</p>
        </div>
      )}

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
