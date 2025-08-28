import { motion } from "framer-motion";
import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/Layout";
import { ScaleIcon, ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
    return [
        { title: "Acerca de Lawyer - Asistente Legal Inteligente" },
        { name: "description", content: "Conoce más sobre Lawyer, la plataforma de asistencia legal basada en inteligencia artificial que está revolucionando el acceso a servicios legales." },
    ];
};

const values = [
    {
        name: 'Accesibilidad',
        description: 'Creemos que el conocimiento legal debe ser accesible para todos, no solo para quienes pueden permitirse contratar un abogado tradicional.',
        icon: UserGroupIcon,
    },
    {
        name: 'Precisión',
        description: 'Nuestro asistente está entrenado con miles de documentos legales y actualizado constantemente para garantizar respuestas precisas y actualizadas.',
        icon: ScaleIcon,
    },
    {
        name: 'Privacidad',
        description: 'Tu información es confidencial. Aplicamos los más altos estándares de seguridad para proteger tus datos y consultas legales.',
        icon: ShieldCheckIcon,
    },
];

const team = [
    {
        name: 'María Rodríguez',
        role: 'Fundadora y CEO',
        imageUrl: 'https://placehold.co/200x200/e2e8f0/1e293b?text=MR',
        bio: 'Abogada con más de 15 años de experiencia, María fundó Lawyer con la misión de democratizar el acceso al conocimiento legal mediante la tecnología.',
    },
    {
        name: 'Carlos Gómez',
        role: 'Director de Tecnología',
        imageUrl: 'https://placehold.co/200x200/e2e8f0/1e293b?text=CG',
        bio: 'Especialista en inteligencia artificial y machine learning, Carlos lidera el desarrollo técnico de nuestro asistente legal inteligente.',
    },
    {
        name: 'Ana Morales',
        role: 'Directora Legal',
        imageUrl: 'https://placehold.co/200x200/e2e8f0/1e293b?text=AM',
        bio: 'Con experiencia en derecho civil y mercantil, Ana supervisa la calidad y precisión de las respuestas generadas por nuestro asistente.',
    },
];

export default function AcercaPage() {
    return (
        <Layout>
            {/* Hero section */}
            <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8 max-w-screen">
                <motion.div
                    className="absolute inset-0 -z-10 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <svg
                        className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
                        aria-hidden="true"
                    >
                        <defs>
                            <pattern
                                id="e813992c-7d03-4cc4-a2bd-151760b470a0"
                                width={200}
                                height={200}
                                x="50%"
                                y={-1}
                                patternUnits="userSpaceOnUse"
                            >
                                <path d="M100 200V.5M.5 .5H200" fill="none" />
                            </pattern>
                        </defs>
                        <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
                            <path
                                d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                                strokeWidth={0}
                            />
                        </svg>
                        <rect width="100%" height="100%" strokeWidth={0} fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
                    </svg>
                </motion.div>

                <motion.div
                    className="mx-auto max-w-2xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Nuestra Misión</h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        En Lawyer, estamos transformando la forma en que las personas acceden al conocimiento legal.
                        Creemos que la tecnología puede hacer que la justicia sea más accesible para todos.
                    </p>
                </motion.div>
            </div>

            {/* Values section */}
            <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-law-accent">Nuestros valores</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Principios que guían nuestro trabajo
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {values.map((value, index) => (
                                <motion.div
                                    key={value.name}
                                    className="flex flex-col"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                        <value.icon className="h-5 w-5 flex-none text-law-accent" aria-hidden="true" />
                                        {value.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">{value.description}</p>
                                    </dd>
                                </motion.div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* Team section */}
            <div className="bg-gray-50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Nuestro equipo</h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Un grupo multidisciplinario de expertos en derecho y tecnología comprometidos con hacer la justicia más accesible.
                        </p>
                    </div>
                    <ul
                        role="list"
                        className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
                    >
                        {team.map((person, index) => (
                            <motion.li
                                key={person.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <img className="aspect-[3/2] w-full rounded-2xl object-cover" src={person.imageUrl} alt="" />
                                <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">{person.name}</h3>
                                <p className="text-base leading-7 text-law-accent">{person.role}</p>
                                <p className="mt-4 text-base leading-7 text-gray-600">{person.bio}</p>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* History section */}
            <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <motion.div
                            className="lg:pr-8 lg:pt-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="lg:max-w-lg">
                                <h2 className="text-base font-semibold leading-7 text-law-accent">Nuestra historia</h2>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">De la idea a la realidad</p>
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    Lawyer comenzó en 2020 como una idea para democratizar el acceso al conocimiento legal.
                                </p>
                                <div className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                                    <p>
                                        Después de años trabajando en grandes firmas de abogados, nuestra fundadora María Rodríguez se dio cuenta de que muchas personas no podían acceder a servicios legales básicos debido a los altos costos y la complejidad del sistema legal.
                                    </p>
                                    <p>
                                        Al unir fuerzas con expertos en inteligencia artificial, creamos un asistente legal que puede responder preguntas legales comunes de forma instantánea y económica, democratizando así el acceso a la justicia.
                                    </p>
                                    <p>
                                        Hoy, Lawyer atiende a miles de usuarios en toda Latinoamérica, y continuamos expandiendo nuestro conocimiento y capacidades para satisfacer las necesidades legales de nuestros usuarios.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.img
                            src="https://placehold.co/800x600/0369a1/FFF?text=Lawyer+Story"
                            alt="Historia de Lawyer"
                            className="w-[24rem] max-w rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[48rem] md:-ml-4 lg:-ml-0"
                            width={2432}
                            height={1442}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
