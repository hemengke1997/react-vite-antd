import React, { useMemo } from 'react';
import { Drawer, DrawerProps } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import classNames from 'classnames';
import { breakpoints } from '@/utils/setting';
import { useSize } from 'ahooks';

// 封装ProDrawer
const ProDrawerComponent: React.FC<
  DrawerProps & {
    children?: React.ReactNode;
  }
> = (props) => {
  const { visible, className, size, ...rest } = props;

  const bodySize = useSize(document.body);

  const width = useMemo(() => {
    const w = bodySize?.width || 0;

    // 优先考虑size
    if (size === 'large') {
      return breakpoints.lg;
    }

    if (w <= 1960) {
      return breakpoints.sm;
    }

    return breakpoints.md;
  }, [bodySize?.width, size]);

  return (
    <Drawer
      closable={false}
      handler={
        visible ? (
          <div
            className={styles.handler}
            onClick={(e) => {
              props?.onClose?.(e);
            }}
          >
            <CloseOutlined
              style={{
                fontSize: 20,
                color: '#fff',
              }}
            />
          </div>
        ) : null
      }
      visible={visible}
      className={classNames(className, styles.drawer)}
      maskClosable={false}
      width={width}
      {...rest}
    >
      {props.children}
    </Drawer>
  );
};

export default React.memo(ProDrawerComponent);
