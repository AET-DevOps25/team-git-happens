import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  text?: string;
}

const Spinner = ({ size = 24, text }: SpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 size={size} className="animate-spin text-tum-red" />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export default Spinner;
