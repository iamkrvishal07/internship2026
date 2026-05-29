export type VerifyOtpPayload = {
  email: string;
  otp: string;
  password: string;
  username: string; 
};

export interface AuthField {
  name: string;
  type: "text" | "email" | "password";
  placeholder: string;
  required?: boolean;
}
