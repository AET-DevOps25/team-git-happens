
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RecommendationService, RecommendedCourse } from '@/services/RecommendationService';
import { UserPreferences } from '@/types';
import CourseCard from '@/components/CourseCard';
import Spinner from '@/components/Spinner';
import { toast } from 'sonner';
import { Compass } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { id: 'ai', label: 'Artificial Intelligence' },
  { id: 'systems', label: 'Systems & Networks' },
  { id: 'theory', label: 'Theoretical Computer Science' },
  { id: 'software', label: 'Software Engineering' },
  { id: 'data', label: 'Data Science & Analytics' },
  { id: 'security', label: 'Security & Privacy' },
  { id: 'graphics', label: 'Graphics & Visualization' },
  { id: 'web', label: 'Web & Mobile Development' },
];

const Recommend = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [creditPreference, setCreditPreference] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [showResults, setShowResults] = useState(false);
  
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
      interests: selectedCategories,
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CATEGORY_OPTIONS.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={option.id} 
                        checked={selectedCategories.includes(option.id)}
                        onCheckedChange={() => handleCategoryChange(option.id)}
                      />
                      <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                  ))}
                </div>
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
                  min="1"
                  max="10"
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
                <Compass className="mr-2 h-5 w-5" />
                {loading ? 'Finding courses...' : 'Get Recommendations'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          {loading ? (
            <Spinner text="Analyzing your preferences and finding the best courses..." />
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
