import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import Loader from "../common/Loader";

import type { AuthField } from "../../types/auth";
import type { UseFormReturn } from "react-hook-form";
import type { ZodTypeAny } from "zod";


interface AuthFormProps {
  title: React.ReactNode;
  isLoading: boolean;
  fields: AuthField[];
  submitLabel: string;
  onSubmit: (values: any) => void;
  footer: React.ReactNode;
  schema: ZodTypeAny;
  form?: UseFormReturn<any>;
  customFields?: { before?: React.ReactNode; after?: React.ReactNode };
}


function AuthForm({
  title,
  isLoading,
  fields,
  submitLabel,
  onSubmit,
  footer,
  schema,
  form: externalForm,
  customFields,
}: AuthFormProps) {

  const internalForm = useForm({
    resolver: zodResolver(schema as any),
  });


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = externalForm ?? internalForm;


  if (isLoading) return <Loader />;


  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div
        className="flex w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ minHeight: "420px" }}
      >
        <div className="w-5/12 bg-black flex flex-col justify-between p-10">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    fill="black"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-wide">
                Flex-Chat
              </span>
            </div>

            <h2
              className="text-white font-black leading-tight"
              style={{
                fontSize: "2.4rem",
                fontFamily: "'Georgia', serif",
                letterSpacing: "-0.5px",
              }}
            >
              THE
              <br />
              MODERN
              <br />
              CHAT
              <br />
              PLATFORM
            </h2>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">
            Fast. Secure. Always&nbsp;connected.
          </p>
        </div>

        <div className="w-7/12 bg-white flex flex-col justify-center px-10 py-8">
          <div className="mb-6">
            <h1 className="text-gray-900 font-bold text-2xl mb-1">{title}</h1>
            <p className="text-gray-400 text-sm">
              Sign in to continue to your workspace
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-0"
          >
            {customFields?.before}

            {fields.map((field) => (
              <div key={field.name} className="w-full">
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-400 outline-none border-2 border-transparent focus:border-gray-900 focus:bg-white transition-all text-sm"
                />
                <p className="text-red-500 text-xs h-4 mt-0.5 leading-4 truncate">
                  {errors?.[field.name]?.message
                    ? String(errors[field.name]?.message)
                    : ""}
                </p>
              </div>
            ))}

            {customFields?.after}

            <button
              type="submit"
              className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors text-sm tracking-wide mt-2"
            >
              {submitLabel}
            </button>

            <div className="text-center text-sm text-gray-500 mt-3">
              {footer}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;