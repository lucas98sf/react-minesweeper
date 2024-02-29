import { authenticator } from "@/auth.server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabaseClient } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { AuthorizationError } from "remix-auth";
import { z } from "zod";

export const loader: LoaderFunction = async ({ request }) => {
	await authenticator.authenticate("sb", request, {
		successRedirect: "/private",
		throwOnError: false,
	});
};

export const action: ActionFunction = async ({ request }) => {
	const form = await request.formData();
	const email = form?.get("email");
	const password = form?.get("password");

	if (!email) throw new AuthorizationError("Email is required");
	if (typeof email !== "string")
		throw new AuthorizationError("Email must be a string");

	if (!password) throw new AuthorizationError("Password is required");
	if (typeof password !== "string")
		throw new AuthorizationError("Password must be a string");

	const isEmail = z.string().email().min(1).safeParse(email);
	const isPassword = z.string().min(6).max(66).safeParse(password);

	if (!isEmail.success) {
		return {
			fieldErrors: {
				name: "email",
				content: isEmail.error,
			},
		};
	}

	if (!isPassword.success) {
		return {
			fieldErrors: {
				name: "password",
				content: isPassword.error,
			},
		};
	}

	const { error } = await supabaseClient.auth.signUp({
		email,
		password,
	});

	if (error) return { formError: error?.message };

	return redirect("/profile");
};

const formSchema = z.object({
	email: z.string().email("Must be a valid email"),
	password: z.string().min(1, "Must enter a password"),
});

export default function SignupScreen() {
	useActionData<typeof action>();
	const data = useLoaderData<typeof loader>();

	const form = useForm<z.infer<typeof formSchema>>({
		defaultValues: {
			email: "",
			password: "",
		},
		resolver: zodResolver(formSchema),
	});

	return (
		<center className="flex h-screen justify-center items-centerl">
			{data?.error && <div>{data.error.message}</div>}
			<Button
				className="absolute top-0 right-0 m-5"
				// onClick={(_) => client.auth.signOut()}
			>
				Sign Out
			</Button>
			<Card className="w-[350px] my-auto">
				<CardHeader>
					<CardTitle>Login</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form className="space-y-8">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="text" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button className="m-7" type="submit">
								Submit
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</center>
	);
}
