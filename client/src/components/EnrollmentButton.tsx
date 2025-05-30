
// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { useAuthStore } from '@/services/AuthService';
// import { CourseService } from '@/services/CourseService';
// import { toast } from 'sonner';
// import { useNavigate } from 'react-router-dom';

// interface EnrollmentButtonProps {
//   courseId: string;
// }

// const EnrollmentButton = ({ courseId }: EnrollmentButtonProps) => {
//   const { student, isAuthenticated } = useAuthStore();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
  
//   // Check if student is enrolled in this course
//   const isEnrolled = student?.enrolledCourses?.includes(courseId) || false;
  
//   const handleEnrollment = async () => {
//     if (!isAuthenticated) {
//       toast.error('Please login to enroll in this course');
//       navigate('/login');
//       return;
//     }
    
//     if (!student) return;
    
//     try {
//       setLoading(true);
      
//       if (isEnrolled) {
//         await CourseService.unenrollFromSubject(student.matriculationNumber, courseId);
//         toast.success('Successfully unenrolled from this course');
//       } else {
//         await CourseService.enrollInSubject(student.matriculationNumber, courseId);
//         toast.success('Successfully enrolled in this course');
//       }
//     } catch (error) {
//       console.error('Enrollment action failed:', error);
//       toast.error(isEnrolled ? 'Failed to unenroll' : 'Failed to enroll');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <Button
//       onClick={handleEnrollment}
//       variant={isEnrolled ? "outline" : "default"}
//       disabled={loading}
//       className="w-full"
//     >
//       {loading ? 'Processing...' : isEnrolled ? 'Unenroll from Course' : 'Enroll in Course'}
//     </Button>
//   );
// };

// export default EnrollmentButton;
