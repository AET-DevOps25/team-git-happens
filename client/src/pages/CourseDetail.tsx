
// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Textarea } from '@/components/ui/textarea';
// import { CourseService } from '@/services/CourseService';
// import { ReviewService } from '@/services/ReviewService';
// import { Subject, Review, Course } from '@/types';
// import Spinner from '@/components/Spinner';
// import StarRating from '@/components/StarRating';
// import ReviewCard from '@/components/ReviewCard';
// import { ArrowLeft, BookOpen, Calendar, UnfoldVertical } from 'lucide-react';
// import { useAuthStore } from '@/services/AuthService';
// import { toast } from 'sonner';
// import EnrollmentButton from '@/components/EnrollmentButton';

// const SubjectDetail = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { student, isAuthenticated } = useAuthStore();
  
//   const [course, setCourse] = useState<Course | null>(null);
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [reviewText, setReviewText] = useState('');
//   const [rating, setRating] = useState(0);
//   const [submitting, setSubmitting] = useState(false);
  
//   useEffect(() => {
//     const loadData = async () => {
//       if (!id) return;
      
//       try {
//         setLoading(true);
//         const courseId = parseInt(id);
        
//         // Load subject details
//         const subjectData = await CourseService.getCourseById(courseId);
//         if (!subjectData) {
//           navigate('/subjects');
//           return;
//         }
        
//         setCourse(subjectData);
        
//         // Load reviews
//         const reviewsData = await ReviewService.getReviewsBy(courseId);
//         setReviews(reviewsData);
//       } catch (error) {
//         console.error('Error loading data:', error);
//         toast.error('Failed to load course details');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     loadData();
//   }, [id, navigate]);
  
//   const handleSubmitReview = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!isAuthenticated) {
//       toast.error('Please login to submit a review');
//       navigate('/login');
//       return;
//     }
    
//     if (!rating) {
//       toast.error('Please select a rating');
//       return;
//     }
    
//     if (!reviewText.trim()) {
//       toast.error('Please enter your review');
//       return;
//     }
    
//     if (!course) return;
    
//     try {
//       setSubmitting(true);
//       const newReview = await ReviewService.addReview(
//         subject.id, 
//         rating, 
//         reviewText
//       );
      
//       // Update the reviews list
//       setReviews(prev => [newReview, ...prev]);
      
//       // Reset form
//       setRating(0);
//       setReviewText('');
      
//       toast.success('Your review has been submitted');
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       toast.error('Failed to submit review');
//     } finally {
//       setSubmitting(false);
//     }
//   };
  
//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case 'EASY':
//         return 'bg-green-100 text-green-800';
//       case 'MEDIUM':
//         return 'bg-amber-100 text-amber-800';
//       case 'HARD':
//         return 'bg-red-100 text-red-800';
//       default:
//         return '';
//     }
//   };
  
//   if (loading) {
//     return <Spinner text="Loading course details..." />;
//   }
  
//   if (!subject) {
//     return (
//       <div className="text-center py-16">
//         <p>Course not found</p>
//         <Button variant="link" onClick={() => navigate('/subjects')}>
//           Back to courses
//         </Button>
//       </div>
//     );
//   }
  
//   return (
//     <div className="container max-w-7xl mx-auto px-4 py-8">
//       <Button 
//         variant="ghost" 
//         onClick={() => navigate('/subjects')}
//         className="mb-4 pl-0"
//       >
//         <ArrowLeft size={18} className="mr-1" />
//         Back to courses
//       </Button>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         {/* Main content */}
//         <div className="md:col-span-2">
//           <h1 className="text-3xl font-bold mb-2">{subject.name}</h1>
          
//           <div className="flex flex-wrap gap-2 mb-6">
//             {subject.tags.map(tag => (
//               <Badge key={tag} variant="secondary">{tag}</Badge>
//             ))}
//           </div>
          
//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <BookOpen className="mr-2 h-5 w-5 text-primary" />
//                 Course Description
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="whitespace-pre-line">{subject.description}</p>
//             </CardContent>
//           </Card>
          
//           {/* Reviews section */}
//           <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
          
//           {/* Review form */}
//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle>Write a Review</CardTitle>
//             </CardHeader>
//             <form onSubmit={handleSubmitReview}>
//               <CardContent className="space-y-4">
//                 <div>
//                   <p className="mb-2 font-medium">Your Rating</p>
//                   <StarRating
//                     value={rating}
//                     onChange={setRating}
//                   />
//                 </div>
//                 <div>
//                   <Textarea
//                     placeholder="Share your experience with this course..."
//                     value={reviewText}
//                     onChange={(e) => setReviewText(e.target.value)}
//                     rows={4}
//                   />
//                 </div>
//               </CardContent>
//               <CardFooter>
//                 <Button type="submit" disabled={submitting || !isAuthenticated}>
//                   {submitting ? 'Submitting...' : 'Submit Review'}
//                 </Button>
//                 {!isAuthenticated && (
//                   <p className="text-sm text-muted-foreground ml-4">
//                     Please <Button variant="link" className="p-0" onClick={() => navigate('/login')}>login</Button> to submit a review
//                   </p>
//                 )}
//               </CardFooter>
//             </form>
//           </Card>
          
//           {/* Review list */}
//           {reviews.length === 0 ? (
//             <div className="text-center py-4">
//               <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {reviews.map(review => (
//                 <ReviewCard key={review.id} review={review} />
//               ))}
//             </div>
//           )}
//         </div>
        
//         {/* Sidebar */}
//         <div>
//           <Card className="sticky top-24">
//             <CardHeader>
//               <CardTitle>Course Details</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-muted-foreground">Difficulty:</span>
//                 <Badge 
//                   variant="outline"
//                   className={getDifficultyColor(subject.difficulty)}
//                 >
//                   {subject.difficulty}
//                 </Badge>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="text-muted-foreground">Credits:</span>
//                 <span className="font-medium">{subject.credits} ECTS</span>
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="text-muted-foreground">Rating:</span>
//                 <div className="flex items-center">
//                   <StarRating value={subject.avgRating || 0} readonly />
//                   <span className="ml-2">({subject.avgRating?.toFixed(1)})</span>
//                 </div>
//               </div>
              
//               <div className="pt-2 border-t">
//                 <div className="flex items-center text-muted-foreground mb-1">
//                   <Calendar size={16} className="mr-2" />
//                   <span className="text-sm">Semester Info</span>
//                 </div>
//                 <p className="text-sm">
//                   Offered in both Winter and Summer semesters
//                 </p>
//               </div>
              
//               <div className="pt-2 border-t">
//                 <div className="flex items-center text-muted-foreground mb-1">
//                   <UnfoldVertical size={16} className="mr-2" />
//                   <span className="text-sm">Prerequisites</span>
//                 </div>
//               </div>
//             </CardContent>
            
//             <CardFooter className="flex-col items-stretch gap-2">
//               <EnrollmentButton subjectId={subject.id} />
              
//               {isAuthenticated ? (
//                 <Button 
//                   onClick={() => navigate('/recommend')}
//                   variant="outline"
//                   className="w-full"
//                 >
//                   Find Similar Courses
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={() => navigate('/login')}
//                   variant="default"
//                   className="w-full"
//                 >
//                   Login to Get Recommendations
//                 </Button>
//               )}
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubjectDetail;
