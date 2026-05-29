import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";
import EmailField from "../../components/common/EmailField";
import UsernameField from "../../components/common/UsernameField";
import routes from "../../constants/routes/routes";
import { useRegister } from "../../hooks/tanstackQuery/useAccountApi";
import { signupSchema } from "../../schemas/signupSchema";

export default function SignUpPage() {

  const navigate = useNavigate();
  const registrationMutation = useRegister();
  const form = useForm({ resolver: zodResolver(signupSchema) });

  const handleSignUp = (values: { email: string; username: string; password: string }) => {
    registrationMutation.mutate(values);
  };

  return (
    <AuthForm
      form={form}
      schema={signupSchema}
      isLoading={registrationMutation.isPending}
      title="Create an account"
      fields={[
        { name: "password", type: "password", placeholder: "Password", required: true },
      ]}
      customFields={{
        before: (
          <UsernameField
            registration={form.register("username")}
            error={form.formState.errors.username?.message as string}
          />
        ),
        after: (
          <EmailField
            registration={form.register("email")}
            error={form.formState.errors.email?.message as string}
          />
        ),
      }}
      submitLabel="Sign Up"
      onSubmit={handleSignUp}
      footer={
        <>
          Already have an account?{" "}
          <span
            className="text-gray-900 font-semibold cursor-pointer underline underline-offset-2 hover:opacity-70 transition-opacity"
            onClick={() => navigate(routes.login)}
          >
            Login
          </span>
        </>
      }
    />
  );
}