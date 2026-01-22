import { useEffect, useState } from 'react'
import './App.css'
import BusinessChat from './components/business-chat/BusinessChat'
import { Toaster } from 'sonner'
import ModalNote from './components/modal-note/ModalNote';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
        {isModalOpen && <ModalNote onClose={closeModal} />}
      <BusinessChat />
      <Toaster
        position="top-center"
        duration={5000}
        closeButton={true}
        visibleToasts={3}
        gap={10}
        offset={{ top: 10, right: 10 }}
        swipeDirections={['top', 'right', 'bottom', 'left']}
        icons={{ success: '👍', info: 'ℹ️', warning: '⚠️', error: '❌' }}
        containerAriaLabel="Toast Container"
      />
    </>
  )
}

export default App
