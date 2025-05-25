import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CourseService } from '@/services/CourseService';
import { CourseDTO, CategoryDTO } from '@/types'; // Import CourseDTO and CategoryDTO
import CourseCard from '@/components/CourseCard';
import Spinner from '@/components/Spinner';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';


const CourseList = () => {
const [courses, setCourses] = useState<CourseDTO[]>([]); // Use CourseDTO
  const [filteredCourses, setFilteredCourses] = useState<CourseDTO[]>([]); // Use CourseDTO
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // Changed from selectedTags to selectedCategories
  

  // Get all unique category names from courses
  const allCategories = Array.from(
    new Set(courses.flatMap(course => course.categories.map(cat => cat.name)))
  ).sort();
  
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await CourseService.getAllCourses(); // This is CourseDTO[]
        setCourses(coursesData);
        setFilteredCourses(coursesData);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, []);
  
  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategories]); // Changed from selectedTags
  
  const filterCourses = () => {
    let filtered = [...courses];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query) ||
        course.id.toLowerCase().includes(query) // Added search by ID
      );
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(course => 
        selectedCategories.some(categoryName => 
          course.categories.some(cat => cat.name === categoryName)
        )
      );
    }
    
    setFilteredCourses(filtered);
  };
  
  const toggleCategory = (categoryName: string) => { // Renamed from toggleTag
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName) 
        : [...prev, categoryName]
    );
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]); // Changed from setSelectedTags
  };
  
  if (loading) {
    return <Spinner text="Loading courses..." />;
  }
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Available Courses</h1>
        
        <div className="w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full md:w-[300px]"
          />
        </div>
      </div>
      
      {/* Categories filter section */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Filter size={18} className="text-muted-foreground mr-2" />
          <h2 className="text-sm font-medium">Filter by categories:</h2> {/* Changed from tags */}
          
          {selectedCategories.length > 0 && ( // Changed from selectedTags
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="ml-2 text-xs h-7 px-2"
            >
              Clear all
              <X size={14} className="ml-1" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {allCategories.map(categoryName => ( // Changed from allTags
            <Badge
              key={categoryName}
              variant={selectedCategories.includes(categoryName) ? "default" : "outline"} // Changed from selectedTags
              className="cursor-pointer"
              onClick={() => toggleCategory(categoryName)} // Changed from toggleTag
            >
              {categoryName}
            </Badge>
          ))}
        </div>
      </div>
      
      {filteredCourses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">No courses match your search criteria.</p>
          <Button variant="link" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
