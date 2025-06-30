export default function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-blue-800 bg-opacity-70 rounded-xl p-6 flex flex-col items-center shadow-md">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-blue-100 text-base">{description}</p>
    </div>
  );
}
