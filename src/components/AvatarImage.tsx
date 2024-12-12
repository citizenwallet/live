import Image from 'next/image';

const AvatarImage = ({ icons } : any) => {
  if (!icons || icons.length === 0) return null;

  return (
    <div className="avatar-container">
      {icons.map((icon: any, index : any) => {
        if (icon.type === 'Image') {
          return (
            <Image
              key={index}
              src={icon.url}
              alt={icon.name || 'Avatar'}
              width={50}
              height={50}
              className="avatar-icon"
            />
          );
        }
        if (icon.type === 'Link') {
          return (
            <a key={index} href={icon.href} target="_blank" rel="noopener noreferrer">
              <Image
                src={icon.iconUrl}
                alt={icon.name || 'Link Icon'}
                width={50}
                height={50}
                className="avatar-link-icon"
              />
            </a>
          );
        }
        return null; // Fallback if the type isn't recognized
      })}
      <style jsx>{`
        .avatar-container {
          display: flex;
          gap: 10px;
        }
        .avatar-icon,
        .avatar-link-icon {
          border-radius: 50%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
};

export default AvatarImage;
