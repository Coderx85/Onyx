import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="grid h-screen md:grid-cols-2">
      <div className="w-full h-[calc(100vh-25px)] m-3 bg-primary text-primary-foreground flex flex-col items-center justify-center rounded-2xl">
        {/* You can add a logo or image here for the auth layout */}
        <div className="p-6">
          <h1 className="text-3xl font-bold">Welcome to Our App</h1>
          <p className="mt-2 text-lg text-primary-foreground/90">
            Please sign in or create an account to continue.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
