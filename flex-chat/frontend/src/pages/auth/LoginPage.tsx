import { useNavigate } from "react-router-dom";

import AuthForm from "../../components/auth/AuthForm";
import routes from "../../constants/routes/routes";
import { useLogin } from "../../hooks/tanstackQuery/useAccountApi";
import { loginSchema } from "../../schemas/loginSchema";

import type z from "zod";
type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {

  const navigate = useNavigate();
  const loginMutation = useLogin();


  const handleLogin = (values: LoginFormData) => {
    loginMutation.mutate(values);
  };


  return (
    <AuthForm
      schema={loginSchema}
      isLoading={loginMutation.isPending}
      title="Welcome back"
      fields={[
        { name: "username", type: "text", placeholder: "Username", required: true },
        { name: "password", type: "password", placeholder: "Password", required: true },
      ]}
      submitLabel="Login"
      onSubmit={handleLogin}
      footer={
        <>
          New here?{" "}
          <span
            className="text-gray-900 font-semibold cursor-pointer underline underline-offset-2 hover:opacity-70 transition-opacity"
            onClick={() => navigate(routes.signup)}
          >
            Sign Up
          </span>
        </>
      }
    />
  );
}

export default LoginPage;