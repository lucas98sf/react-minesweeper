import { usePageContext } from "./usePageContext";

export { Link };

function Link(props: {
	href: string;
	className?: string;
	children: React.ReactNode;
}) {
	const pageContext = usePageContext();
	const { urlPathname } = pageContext;
	let { href } = props;
	href = normalize(import.meta.env.BASE_URL + href);
	const isActive =
		href === import.meta.env.BASE_URL
			? urlPathname === href
			: urlPathname.startsWith(href);
	const className = [props.className, isActive && "is-active"]
		.filter(Boolean)
		.join(" ");
	return <a {...props} className={className} href={href} />;
}

function normalize(url: string) {
	return `/${url.split("/").filter(Boolean).join("/")}`;
}
