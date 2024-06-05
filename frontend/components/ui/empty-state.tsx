export const EmptyState = ({ icon, message }: { icon: React.ReactNode, message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-6xl mb-4">
        {icon}
      </div>
      <p className="text-xl text-gray-500">
        {message}
      </p>
    </div>
  );
};

