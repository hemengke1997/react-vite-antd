import { Modal, ModalProps } from 'antd';

const ProModal: React.FC<ModalProps> = (props) => {
  return <Modal transitionName="nr-move-up" {...props} />;
};

export default ProModal;
