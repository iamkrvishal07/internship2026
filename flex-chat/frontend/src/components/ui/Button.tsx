import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

function Button({ children, type = "button", className, onClick, ...props }: ButtonProps) {
  const classesToBeAdded = `
    w-45 py-2
    btn 
    text-primary-content
    font-semibold
    rounded-full
    hover:scale-105
    transition 
    ${className || "btn-secondary"}
  `

  return (
    <button
      type={type}
      onClick={onClick}
      className={classesToBeAdded}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;