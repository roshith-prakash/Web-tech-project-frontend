import { cn } from "@/lib/utils";
import { useState, type InputHTMLAttributes } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  placeholder: string;
}

const PasswordInput = ({
  value,
  placeholder,
  onChange,
  disabled,
  className,
  ...props
}: PasswordInputProps) => {
  // State to toggle between text and password visibility
  const [display, setDisplay] = useState(false);

  return (
    <div className="relative w-full">
      <input
        disabled={disabled}
        type={display ? "text" : "password"}
        className={cn(
          "dark:placeholder:text-grey/50 placeholder:text-darkbg/50 text-md border-darkbg/50 mt-3 min-h-8 w-full rounded-lg border-2 bg-transparent px-4 py-2 pr-10 placeholder:text-sm focus:outline-none dark:border-white/50",
          className
        )}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        {...props}
      />
      {display ? (
        <FaEye
          className="absolute top-6 right-4 cursor-pointer"
          onClick={() => {
            if (!disabled) setDisplay((prev) => !prev);
          }}
        />
      ) : (
        <FaEyeSlash
          className="absolute top-6 right-4 cursor-pointer"
          onClick={() => {
            if (!disabled) setDisplay((prev) => !prev);
          }}
        />
      )}
    </div>
  );
};

export default PasswordInput;
