import React from 'react';
import styles from './index.module.less';

const SpinLoadingIcon: React.FC = () => {
  return (
    <div className="loading-delay">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
        className={styles.loadingWrapper}
      >
        <g
          fill="none"
          strokeWidth="4"
          strokeMiterlimit="10"
          stroke="currentColor"
          className={styles.circle}
        >
          <circle cx="25" cy="25" r="20" opacity=".3"></circle>
          <circle
            cx="25"
            cy="25"
            r="20"
            strokeDasharray="25,200"
            strokeLinecap="round"
            className={styles.dash}
          ></circle>
        </g>
      </svg>
    </div>
  );
};

export default SpinLoadingIcon;
