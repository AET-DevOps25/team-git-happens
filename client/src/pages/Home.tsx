import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Compass, BookOpen, Star, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/services/AuthService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-16 mt-8 animate-fade-in">
        <img src="/app-logo.png" alt="Course Compass Logo" className="h-40 w-40 mb-4"/>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Course Compass
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
          Your AI-powered guide to finding the perfect electives at 
          <span className="text-tum-blue font-medium"> TUM Informatics</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button size="lg" onClick={() => navigate('/courses')}>
            <BookOpen className="mr-2 h-5 w-5" />
            Browse Courses
          </Button>
          {isAuthenticated ? (
            <Button size="lg" variant="outline" onClick={() => navigate('/recommend')}>
              <Compass className="mr-2 h-5 w-5" />
              Get Recommendations
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              <ArrowRight className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="animate-slide-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-tum-blue" />
              Explore Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Browse through our comprehensive catalog of TUM Informatics electives, 
              with detailed descriptions and student ratings.
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in [animation-delay:200ms]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-tum-blue" />
              Read & Share Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Benefit from the experiences of your peers and contribute your own 
              reviews to help fellow students.
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in [animation-delay:400ms]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Compass className="mr-2 h-5 w-5 text-tum-blue" />
              Get AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Let our AI analyze your preferences and suggest electives that 
              match your interests and academic goals.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gradient-to-br from-tum-blue/10 to-tum-yellow/10 p-8 rounded-lg text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to find your perfect electives?</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Join Course Compass today and discover courses tailored to your interests and goals.
        </p>
        <Button size="lg" onClick={() => navigate(isAuthenticated ? '/recommend' : '/login')}>
          {isAuthenticated ? 'Get Personalized Recommendations' : 'Sign In Now'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Home;
