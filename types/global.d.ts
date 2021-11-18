/**
 * modal/drawer 等反馈组件统一类型
 */
declare namespace Feedback {
  type FeedbackProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
  };
}
