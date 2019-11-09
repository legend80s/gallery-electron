import React, { useState, useEffect } from 'react';
import Carousel, { Modal, ModalGateway } from 'react-images';
import PhotoWall from "react-photo-gallery";

// import fetch from '../utils/fetch'
// import { showDemoPhotos } from './gallery-from-demo-api';

import './Gallery.css';

export function Gallery({ theme, photos }) {
  // const [photos, setPhotos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // showDemoPhotos(setPhotos);
  }, []);

  // console.log('photos:', photos, 'selectedIndex', selectedIndex, 'modalIsOpen', modalIsOpen);

  const toggleModal = (index) => {
    setSelectedIndex(index);
    setModalIsOpen(!modalIsOpen);
  };

  return (<div className={'gallery ' + theme}>
    {modalIsOpen && <ModalGateway>
        <Modal onClose={() => setModalIsOpen(!modalIsOpen)}>
          <Carousel views={photos} currentIndex={selectedIndex} />
        </Modal>
    </ModalGateway>}

    {photos.length ? <PhotoWall
      photos={photos}
      direction={'row'}
      onClick={(_, { index }) => toggleModal(index)}
    /> : null}
  </div>);
}
