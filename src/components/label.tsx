import React from "react";

type Props = {
  title: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

const Label = (props: Props) => {
  const { title, icon, className } = props;

  return (
    <div className={`flex items-center gap-2 ${className ? className : ""}`}>
      {!!icon && <div className="text-gray-500">{icon}</div>}
      <span className="break-all">{title}</span>
    </div>
  );
};

export default Label;
