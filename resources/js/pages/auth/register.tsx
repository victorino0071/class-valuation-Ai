import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <AuthLayout title="Create your account" description="Join our community and start your journey today.">
            <Head title="Register" />

            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-8"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Nome */}
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Full name"
                                    autoComplete="name"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/30"
                                />
                                <InputError message={errors.name} className="mt-1 text-xs text-red-500" />
                            </div>

                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    autoComplete="email"
                                    required
                                    tabIndex={2}
                                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/30"
                                />
                                <InputError message={errors.email} className="mt-1 text-xs text-red-500" />
                            </div>

                            {/* Senha */}
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    autoComplete="new-password"
                                    required
                                    tabIndex={3}
                                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/30"
                                />
                                <InputError message={errors.password} className="mt-1 text-xs text-red-500" />
                            </div>

                            {/* Confirmação de senha */}
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-muted-foreground">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    autoComplete="new-password"
                                    required
                                    tabIndex={4}
                                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/30"
                                />
                                <InputError message={errors.password_confirmation} className="mt-1 text-xs text-red-500" />
                            </div>

                            {/* Botão */}
                            <Button
                                type="submit"
                                disabled={processing}
                                tabIndex={5}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4 animate-pulse" />
                                        Creating account...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Create account
                                    </span>
                                )}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
