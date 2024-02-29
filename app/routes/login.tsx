import { authenticator, supabaseStrategy } from "@/auth.server";
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
import { zodResolver } from "@hookform/resolvers/zod";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
	email: z.string().email("Must be a valid email"),
	password: z.string().min(1, "Must enter a password"),
});

export const action: ActionFunction = async ({ request }) => {
	await authenticator.authenticate("sb", request, {
		successRedirect: "/private",
		failureRedirect: "/login",
	});
};

export const loader: LoaderFunction = async ({ request }) => {
	await supabaseStrategy.checkSession(request, {
		successRedirect: "/private",
	});

	const session = await sessionStorage.getSession(
		request.headers.get("Cookie"),
	);

	const error = session.get(authenticator.sessionErrorKey);

	return json({ error });
};

export const LoginScreen = () => {
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
};
