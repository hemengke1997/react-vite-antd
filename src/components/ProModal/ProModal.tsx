import { Modal, ModalProps } from 'antd';

const ProModal: React.FC<ModalProps> = (props) => {
  return <Modal transitionName="ant-move-up" {...props} />;
};

export default ProModal;
