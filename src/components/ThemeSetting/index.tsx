import { SettingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import ThemeSetting from './ThemeSetting';
import styles from './index.module.less';

const Theme: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      <div className={styles.settingIcon} onClick={() => setVisible(true)}>
        <SettingOutlined
          style={{
            color: '#fff',
            fontSize: 20,
          }}
        />
      </div>
      <ThemeSetting visible={visible} setVisible={setVisible} />
    </>
  );
};

export default Theme;
