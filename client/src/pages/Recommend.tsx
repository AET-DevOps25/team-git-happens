
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RecommendationService, RecommendedCourse } from '@/services/RecommendationService';
import { CourseService } from '@/services/CourseService';
import { UserPreferences, CategoryDTO } from '@/types';
import CourseCard from '@/components/CourseCard';
import Spinner from '@/components/Spinner';
import { toast } from 'sonner';
import { Compass } from 'lucide-react';

const Recommend = () => {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [creditPreference, setCreditPreference] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch categories from the API on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categoriesData = await CourseService.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }
    
    const preferences: UserPreferences = {
      interests: selectedCategories, // Use category names directly from the database
      creditPreference: creditPreference ? parseInt(creditPreference) : undefined,
      additionalInfo: description
    };
    
    try {
      setLoading(true);
      const data = await RecommendationService.getRecommendationsFromPreferences(preferences);
      setRecommendations(data);
      setShowResults(true);
      
      if (data.length === 0) {
        toast.info('No courses match your preferences. Try selecting different options.');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setShowResults(false);
    setRecommendations([]);
    setSelectedCategories([]);
    setCreditPreference('');
    setDescription('');
  };
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {showResults ? 'Your Recommended Courses' : 'Get Course Recommendations'}
      </h1>
      
      {!showResults ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Categories section */}
              <div>
                <h2 className="text-lg font-medium mb-4">What categories are you interested in? *</h2>
                {categoriesLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Loading categories...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <div key={category.name} className="flex items-center space-x-2">
                        <Checkbox 
                          id={category.name} 
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() => handleCategoryChange(category.name)}
                        />
                        <Label htmlFor={category.name}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Credit preference */}
              <div>
                <h2 className="text-lg font-medium mb-4">How many credits do you prefer?</h2>
                <Input
                  type="number"
                  placeholder="Enter number of credits (optional)"
                  value={creditPreference}
                  onChange={(e) => setCreditPreference(e.target.value)}
                  className="w-full max-w-xs"
                  min="3"
                  max="45"
                />
              </div>
              
              {/* Description */}
              <div>
                <h2 className="text-lg font-medium mb-2">Tell us about yourself *</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Describe your background, goals, experience level, and what you're looking to achieve. This helps us provide better recommendations.
                </p>
                <Textarea
                  placeholder="I'm a computer science student with experience in..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Compass className="mr-2 h-5 w-5" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <h3 className="text-lg font-medium mb-2">AI is analyzing your preferences...</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Our AI is carefully reviewing your interests and matching them with the best courses. This may take a few seconds.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <Button variant="outline" onClick={handleReset}>
                  Adjust Preferences
                </Button>
              </div>
              
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg text-muted-foreground mb-4">
                    No courses match your preferences. Try adjusting your criteria.
                  </p>
                  <Button onClick={handleReset}>
                    Try Different Preferences
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex flex-col">
                      <CourseCard course={rec.course} />
                      <div className="mt-4 bg-muted/50 p-4 rounded-md">
                        <h3 className="text-sm font-medium mb-1">Why we recommend this:</h3>
                        <p className="text-sm text-muted-foreground">
                          {rec.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Recommend;
