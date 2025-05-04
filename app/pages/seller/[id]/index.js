import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SellerRedirect() {
  const router = useRouter();
  const { id } = router.query;
  
  useEffect(() => {
    if (id) {
      // Redirect to the correct sellers path
      router.replace(`/sellers/${id}`);
    }
  }, [id, router]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 