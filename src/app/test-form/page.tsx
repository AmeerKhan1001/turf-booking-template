import { FormFoundationTest } from '@/components/forms/FormFoundationTest';

export default function TestFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Enhanced Form Foundation Test
        </h1>
        <FormFoundationTest />
      </div>
    </div>
  );
}