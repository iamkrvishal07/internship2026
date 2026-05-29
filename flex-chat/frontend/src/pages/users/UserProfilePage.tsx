import Loader from "../../components/common/Loader";
import { useFetchUserProfile, useUpdateUserProfile } from "../../hooks/tanstackQuery/useUserApi";

import { HiOutlineFaceSmile, HiOutlineIdentification } from "react-icons/hi2";
import { MdEmail, MdCalendarMonth } from "react-icons/md";
import { CgProfile } from "react-icons/cg";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userProfileSchema } from "../../schemas/userProfileSchema";
import { useState, useEffect } from "react";

type UserProfile = z.infer<typeof userProfileSchema>;
const inputCls =
  "w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 outline-none border-2 border-transparent focus:border-gray-900 focus:bg-white transition-all text-[15px]";

const readonlyCls = "w-full py-2 text-[15px] text-gray-600";
const btnBase =
  "inline-flex items-center justify-center w-[108px] h-10 rounded-xl text-[14px] font-semibold transition-colors";
const btnGhost = `${btnBase} bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300`;
const btnDark  = `${btnBase} bg-gray-900 text-white hover:bg-gray-700 active:bg-black disabled:opacity-40 disabled:cursor-not-allowed`;

interface RowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  error?: string;
}

const Row = ({ icon, label, children, error }: RowProps) => (
  <div className="py-2.5 border-b border-gray-100 last:border-0">
    <div className="flex items-start gap-3">
      <span className="mt-[30px] text-gray-400 text-base shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="mb-1 text-[11px] uppercase tracking-wider text-gray-400">
          {label}
        </p>
        {children}
      </div>
    </div>
    {error && (
      <p className="ml-7 mt-1 text-xs text-red-500 leading-4">{error}</p>
    )}
  </div>
);

const UserProfilePage = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { data, isLoading } = useFetchUserProfile();
  const { mutate, isPending } = useUpdateUserProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const onSubmit = (values: UserProfile) => {
    mutate(values, {
      onSuccess: () => setIsEditMode(false),
      onError: () => {
        setIsEditMode(false);
        reset(data);
      },
    });
  };

  function handleEditClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    reset(data);
    setIsEditMode(true);
  }

  function handleCancelClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    reset(data);
    setIsEditMode(false);
  };

  if (isLoading || isPending) return <Loader />;
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-6 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl px-14 py-11 my-auto">

        <div className="flex flex-col items-center mb-8">
          <img
            src={data?.avatarUrl || "https://placehold.co/88x88"}
            alt="avatar"
            className="w-22 h-22 rounded-full object-cover bg-gray-200"
            style={{ width: 88, height: 88 }}
          />
          <h1 className="mt-4 text-[22px] font-bold text-gray-900">
            {data?.fullName || "Full Name"}
          </h1>
          <p className="text-[15px] text-gray-400 mt-1">
            @{data?.username || "username"}
          </p>
        </div>

        <hr className="border-gray-100 mb-6" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold text-gray-900">
            Account Information
          </h2>
          {!isEditMode && (
            <button type="button" onClick={handleEditClick} className={btnGhost}>
              Edit
            </button>
          )}
        </div>


        <form onSubmit={handleSubmit(onSubmit)}>
          <Row icon={<MdEmail />} label="Email">
            <div className={readonlyCls}>{data?.email || "—"}</div>
          </Row>

          <Row icon={<CgProfile />} label="Full Name" error={errors.fullName?.message}>
            {isEditMode
              ? <input {...register("fullName")} type="text" className={inputCls} placeholder="Full name" />
              : <div className={readonlyCls}>{data?.fullName || "—"}</div>}
          </Row>

          <Row icon={<HiOutlineIdentification />} label="Bio" error={errors.bio?.message}>
            {isEditMode
              ? <input {...register("bio")} type="text" className={inputCls} placeholder="Short bio" />
              : <div className={readonlyCls}>{data?.bio || "—"}</div>}
          </Row>

          <Row icon={<HiOutlineFaceSmile />} label="Status" error={errors.statusMessage?.message}>
            {isEditMode
              ? <input {...register("statusMessage")} type="text" className={inputCls} placeholder="Status message" />
              : <div className={readonlyCls}>{data?.statusMessage || "—"}</div>}
          </Row>

          <Row icon={<MdCalendarMonth />} label="Joined On">
            <div className={readonlyCls}>{data?.createdAt || "—"}</div>
          </Row>

          {isEditMode && (
            <div className="flex items-center justify-center gap-3 mt-7">
              <button type="button" onClick={handleCancelClick} className={btnGhost}>
                Cancel
              </button>
              <button type="submit" disabled={!isDirty || isPending} className={btnDark}>
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;