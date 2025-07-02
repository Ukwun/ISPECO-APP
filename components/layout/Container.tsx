import { ReactNode } from "react";

// Add responsive padding using Tailwind CSS utility classes
// px-4: padding left/right, py-8: padding top/bottom, sm:px-6, lg:px-8 for responsiveness

type ContainerProps = {
    children: ReactNode;
};

const Container = ({ children }: ContainerProps) => {
    return (
        <div
            style={{
                maxWidth: "1920px", // ~max-w-2xl
                margin: "40px auto", // 40px top/bottom, auto left/right
                padding: "32px 16px", // 32px top/bottom, 16px left/right
            }}
        >
            {children}
        </div>
    );
};

export default Container;