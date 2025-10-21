import Image from 'next/image';

interface AvatarProps {
  size?: 'small' | 'large';
}

export default function Avatar({ size = 'large' }: AvatarProps) {
  const dimensions = size === 'small' ? 64 : 128;
  const containerClass = size === 'small' ? 'w-16 h-16' : 'w-32 h-32';
  
  return (
    <div className={`${containerClass} rounded-full flex items-center justify-center shadow-lg overflow-hidden`}>
      <Image
        src="/anderson.jpg"
        alt="Avatar do Mentor"
        width={dimensions}
        height={dimensions}
        className="object-cover"
      />
    </div>
  );
}
