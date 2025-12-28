import { useState } from "react"
import { Card, CardBody, Modal, ModalContent, ModalBody, Button } from "@heroui/react"

interface ImageGalleryProps {
  images: string[]
  columns?: 2 | 3
}

export default function ImageGallery({ images, columns = 3 }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  const gridCols = columns === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"

  return (
    <>
      <div className={`grid ${gridCols} gap-2`}>
        {images.map((image, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:opacity-80 transition"
            isPressable
            onPress={() => setSelectedImage(image)}
          >
            <CardBody className="p-0 overflow-hidden">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="h-32 aspect-square object-cover rounded-lg"
              />
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalBody className="p-0">
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Full size"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <Button
                  isIconOnly
                  color="default"
                  variant="flat"
                  className="absolute top-2 right-2"
                  onPress={() => setSelectedImage(null)}
                >
                  ✕
                </Button>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
