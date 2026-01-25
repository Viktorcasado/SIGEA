import React from 'react';

interface ProfileGroupProps {
  title: string;
  children: React.ReactElement[] | React.ReactElement;
}

const ProfileGroup: React.FC<ProfileGroupProps> = ({ title, children }) => {
  const childrenArray = React.Children.toArray(children);
  return (
    <div>
      <h2 className="px-4 pb-2 text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">{title}</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
        {childrenArray.map((child, index) => (
          <div key={index}>
            {child}
            {index < childrenArray.length - 1 && <div className="ml-14 h-px bg-gray-200 dark:bg-gray-700/50" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileGroup;