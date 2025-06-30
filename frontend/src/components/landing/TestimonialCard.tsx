export default function TestimonialCard({
  name,
  company,
  text,
  avatar,
}: {
  name: string;
  company: string;
  text: string;
  avatar: string;
}) {
  return (
    <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center shadow-md border border-white/10">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mb-4">
        {avatar}
      </div>
      <p className="text-lg italic mb-4">“{text}”</p>
      <div className="font-semibold">{name}</div>
      <div className="text-blue-200 text-sm">{company}</div>
    </div>
  );
}
