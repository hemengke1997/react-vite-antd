import ProDrawer from '../ProDrawer';
import { ColorChangeHandler, SketchPicker } from 'react-color';
import { useEffect, useState } from 'react';
import { Button, ConfigProvider, Divider, message } from 'antd';
import { themeName, theme as defaultTheme } from '@/utils/setting';
import type { Theme } from 'antd/es/config-provider/context';
import useMountControlledState from '@/hooks/useMountControlledState';
import styles from './index.module.less';

type ThemeCompProps = {
  title: string;
  name: string;
  color: string;
  onColorChange: (c: string) => void;
};

const ThemeComp: React.FC<ThemeCompProps> = (props) => {
  const { title, color: propColor, onColorChange, name } = props;

  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);

  const [color, setColor] = useMountControlledState<string>('', {
    value: propColor,
    onChange: onColorChange,
  });

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleClick = () => {
    setDisplayColorPicker((t) => !t);
  };

  const handleChange: ColorChangeHandler = (c) => {
    setColor(c.hex);

    const msg = `这是${title}`;

    switch (name as keyof Theme) {
      case 'successColor':
        message.success(msg);
        break;
      case 'errorColor':
        message.error(msg);
        break;
      case 'infoColor':
        message.info(msg);
        break;
      case 'warningColor':
        message.warning(msg);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <h4>{title}</h4>
      <div className={styles.swatch} onClick={handleClick}>
        <div
          className={styles.color}
          style={{
            background: color,
          }}
        />
      </div>
      <Divider />
      {displayColorPicker ? (
        <div className={styles.popover}>
          <div className={styles.cover} onClick={handleClose} />
          <SketchPicker
            presetColors={[
              '#707eff',
              '#f5222d',
              '#fa541c',
              '#fa8c16',
              '#faad14',
              '#fadb14',
              '#a0d911',
              '#52c41a',
              '#13c2c2',
              '#1890ff',
              '#2f54eb',
              '#722ed1',
              '#eb2f96',
            ]}
            disableAlpha
            color={color}
            onChange={handleChange}
          />
        </div>
      ) : null}
    </div>
  );
};

const ThemeSetting: React.FC<Feedback.FeedbackProps> = (props) => {
  const { visible, setVisible } = props;

  const [themeList, setThemeList] = useState<ThemeCompProps[]>([]);

  const getTheme = () => {
    return JSON.parse(localStorage.getItem(themeName) || '{}');
  };

  const setTheme = (color: Partial<Record<keyof Theme, string>>) => {
    const prevColors = getTheme();

    localStorage.setItem(
      themeName,
      JSON.stringify({
        ...prevColors,
        ...color,
      }),
    );

    ConfigProvider.config({
      theme: {
        ...prevColors,
        ...color,
      },
    });

    setThemeList((list) => {
      const i = list.findIndex((item) => item.name === Object.keys(color)[0]);
      if (i > -1) {
        list[i].color = color[Object.keys(color)[0]];
      }
      return [...list];
    });
  };

  const initTheme = () => {
    const titleList: Partial<Record<keyof Theme, string>>[] = [
      {
        primaryColor: '主题色',
      },
      {
        successColor: '成功色',
      },
      {
        errorColor: '错误色',
      },
      {
        warningColor: '警告色',
      },
      {
        infoColor: '信息色',
      },
    ];

    const defaultColors = getTheme();

    const t = titleList.map((item) => {
      const color = Object.keys(item)[0];
      return {
        name: color,
        title: item[color],
        color: defaultColors[color],
        onColorChange: (c: string) => setTheme({ [color]: c }),
      };
    });

    setThemeList(t);
  };

  const reset = () => {
    localStorage.setItem(themeName, JSON.stringify(defaultTheme));

    ConfigProvider.config({
      theme: defaultTheme,
    });

    initTheme();
  };

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <ProDrawer
      visible={visible}
      onClose={() => setVisible(false)}
      footer={
        <div>
          <Button onClick={reset}>重置</Button>
        </div>
      }
    >
      {themeList?.map((item, index) => (
        <ThemeComp key={index} {...item} />
      ))}
    </ProDrawer>
  );
};

export default ThemeSetting;
