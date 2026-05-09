import type { ReactNode } from 'react';
import styles from './layout-shell.module.css';

type LayoutShellProps = {
  children: ReactNode;
};

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.frame}>
        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
}
