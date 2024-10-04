// Type definitions for @tryghost/admin-api

import { sign as JwtSign } from "jsonwebtoken";
import FormData = require("form-data");

type TokenFunction = (key: string, audience: string) => ReturnType<typeof JwtSign>;

interface Config {
    ghostPath: string;
    userAgent: boolean;
    generateToken: TokenFunction;
    makeRequest: (options: { url: string; method: string; data: any; params?: any; headers?: any }) => Promise<any>;
}

type Options =
    & (
        | {
            url: string;
        }
        | {
            /**
             * @deprecated use "url" instead
             */
            host: string;
        }
    )
    & {
        version: string | boolean;
        key: string;
    }
    & Partial<Pick<Config, "ghostPath" | "userAgent" | "generateToken" | "makeRequest">>;

interface BasicQueryParams {
    include?: string;
    fields?: string;
}

type BrowseQueryParams = BasicQueryParams & {
    filter?: string;
    limit?: number;
    page?: number;
    order?: string;
};

interface StandardEndpoints<T, Q, R = T & { meta: any }> {
    browse: (options?: BrowseQueryParams & Q) => Promise<R[]>;
    read: (
        data: Partial<T> & ({ id: string } | { email: string } | { slug: string }),
        queryParams?: BasicQueryParams,
    ) => Promise<R>;
    add: (data: Partial<T>, queryParams?: BasicQueryParams & Q) => Promise<R>;
    edit: (data: Partial<T> & { id: string }, queryParams?: BasicQueryParams & Q) => Promise<R>;
    delete: (
        data: Partial<T> & ({ id: string } | { email: string }),
        queryParams?: BasicQueryParams & Q,
    ) => Promise<any>;
}

type Page = PageOrPost;
type Post = PageOrPost;
interface PageOrPost {
    id: string;
    uuid: string;
    title: string;
    slug: string;
    lexical?: string;
    html?: string;
    status: "draft" | "scheduled" | "published" | "sent";
    visibility: string;
    created_at: Date;
    updated_at: Date;
    published_at: Date | null;
    custom_excerpt: string | null;
    feature_image: string | null;
    feature_image_alt: string | null;
    feature_image_caption: string | null;
    tags: Tag[] | string[];
    authors: User[] | string[];
    primary_author: User;
    primary_tag: Tag;
    url: string;
    excerpt: string;
    og_image: string | null;
    og_title: string | null;
    og_description: string | null;
    twitter_image: string | null;
    twitter_title: string | null;
    twitter_description: string | null;
    meta_title: string | null;
    meta_description: string | null;
    email_only: boolean;
    newsletter?: Newsletter;
    email?: PostEmailStatus;
}

interface PostEmailStatus {
    id: string;
    uuid: string;
    status: string;
    recipient_filter: string;
    error: string | null;
    error_data: string;
    email_count: number;
    delivered_count: number;
    opened_count: number;
    failed_count: number;
    subject: string;
    from: string;
    reply_to: string;
    html: string;
    plaintext: string;
    track_opens: boolean;
    submitted_at: Date;
    created_at: Date;
    updated_at: Date;
}

interface Tier {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    active: boolean;
    type: string;
    welcome_page_url: string | null;
    created_at: Date;
    updated_at: Date;
    stripe_prices: any;
    monthly_price: number | null;
    yearly_price: number | null;
    benefits: string[];
    visibility: string;
}

interface Newsletter {
    id: string;
    /**
     * Public name for the newsletter
     */
    name: string;
    /**
     * Public description of the newsletter
     */
    description: string | null;
    /**
     * The reference to this newsletter that can be used in the newsletter option when sending a post via email
     */
    slug: string;
    sender_name: string | null;
    sender_email: string | null;
    sender_reply_to: "newsletter" | "support";
    status: "active" | "archived";
    visibility: string;
    subscribe_on_signup: boolean;
    sort_order: number;
    /**
     * Path to an image to show at the top of emails. Recommended size 1200x600
     */
    header_image: string | null;
    show_header_icon: boolean;
    show_header_title: boolean;
    title_font_category: "serif" | "sans_serif";
    title_alignment: string;
    show_feature_image: boolean;
    body_font_category: "serif" | "sans_serif";
    /**
     * Extra information or legal text to show in the footer of emails. Should contain valid HTML.
     */
    footer_content: string | null;
    /**
     * Show you’re a part of the indie publishing movement by adding a small Ghost badge in the footer
     */
    show_badge: boolean;
    created_at: Date;
    updated_at: Date;
    show_header_name: boolean;
    uuid: string;
}

interface Member {
    id: string;
    uuid: string;
    email: string;
    name: string;
    note: string | null;
    geolocation: string | null;
    created_at: Date;
    updated_at: Date;
    labels: Label[];
    subscriptions: Subscription[];
    avatar_image: string;
    email_count: number;
    email_opened_count: number;
    email_open_rate: number | null;
    status: "free" | "paid";
    last_seen_at: Date;
    newsletters: Newsletter[] | Array<{ id: string }>;
}

interface Offer {
    id: string;
    /**
     * Internal name for an offer, must be unique
     */
    name: string;
    /**
     * Shortcode for the offer, for example: https://yoursite.com/black-friday
     */
    code: string;
    /**
     * Name displayed in the offer window
     */
    display_title: string;
    /**
     * Text displayed in the offer window
     */
    display_description: string;
    /**
     * percent or fixed - whether the amount off is a percentage or fixed
     */
    type: "percent" | "fixed";
    /**
     * month or year - denotes if offer applies to tier's monthly or yearly price
     */
    cadence: "month" | "year";
    /**
     * Offer discount amount, as a percentage or fixed value as set in type. Amount is always denoted by the smallest currency unit (e.g., 100 cents instead of $1.00 in USD)
     */
    amount: number;
    /**
     * once/forever/repeating. repeating duration is only available when cadence is month
     */
    duration: "once" | "forever" | "repeating";
    /**
     * Number of months offer should be repeated when duration is repeating
     */
    duration_in_months: number | null;
    /**
     * Denotes whether the offer `currency` is restricted. If so, changing the currency invalidates the offer
     */
    currency_restriction: boolean;
    /**
     * fixed type offers only - specifies tier's currency as three letter ISO currency code
     */
    currency: string | null;
    status: "active" | "archived";
    /**
     * Number of times the offer has been redeemed
     */
    redemption_count: number;
    /**
     * Tier on which offer is applied
     */
    tier: { id: string; name: string };
}

interface Subscription {
    id: string;
    customer?: StripeCustomerLink;
    status: string;
    start_date: Date;
    default_payment_card_last4: string;
    cancel_at_period_end: boolean;
    cancellation_reason: string | null;
    current_period_end: Date;
    price: {
        id: string;
        price_id: string;
        nickname: string;
        amount: number;
        interval: string;
        type: string;
        currency: string;
    };
    tier: Tier;
    offer: Offer | null;
}

interface StripeCustomerLink {
    id: string;
    name: string;
    email: string;
}

interface Tag {
    id: string;
    name: string;
    slug: string;
    description: string;
    feature_image: string;
    visibility: "public" | "internal";
    meta_title: string;
    meta_description: string;
    created_at: string;
    updated_at: string;
    og_image: string;
    og_title: string;
    og_description: string;
    twitter_image: string;
    twitter_title: string;
    twitter_description: string;
    codeinjection_head: string;
    codeinjection_foot: string;
    canonical_url: string;
    accent_color: string;
    parent: string;
    url: string;
}

interface User {
    id: string;
    name: string;
    slug: string;
    email: string;
    profile_image: string;
    cover_image: string | null;
    bio: string | null;
    website: string | null;
    location: string | null;
    facebook: string | null;
    twitter: string | null;
    accessibility: string | null;
    status: string;
    meta_title: string | null;
    meta_description: string | null;
    tour: string | null;
    last_seen: Date;
    created_at: Date;
    updated_at: Date;
    roles: Role[];
    count?: { posts: number };
    url: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface Webhook {
    id: string;
    event: string;
    target_url: string;
    name: string | null;
    secret: string | null;
    api_version: string;
    integration_id: string;
    status: "available";
    last_triggered_at: Date | null;
    last_triggered_status: string | null;
    last_triggered_error: string | null;
    created_at: Date;
    updated_at: Date;
}

interface Label {
    name: string;
    slug: string;
}

interface Image {
    url: string;
    ref?: string;
}

interface Site {
    title: string;
    description: string;
    logo: string;
    url: string;
    version: string;
}

interface Theme {
    name: string;
    package: any;
    active: boolean;
    templates: Array<{
        filename: string;
        name: string;
        for: string[];
        slug: string | null;
    }>;
}

interface GhostAdmin {
    posts: Omit<StandardEndpoints<Post, { formats?: string }>, "add"> & {
        add: (data: Partial<Post>, queryParams?: BasicQueryParams & { source?: string }) => Promise<Post>;
    };
    pages: StandardEndpoints<Page, { formats?: string }>;
    tags: StandardEndpoints<Tag, {}>;
    webhooks: Pick<StandardEndpoints<Webhook, {}>, "add" | "edit" | "delete">;
    members: StandardEndpoints<Member, {}>;
    users: StandardEndpoints<User, {}>;
    newsletters: Omit<StandardEndpoints<Newsletter, {}>, "add"> & {
        add: (
            data: Partial<Newsletter>,
            queryParams?: BasicQueryParams & { opt_in_existing?: boolean },
        ) => Promise<Newsletter>;
    };
    // tiers: StandardEndpoints<Tier, {}>; -- in API but not in JS

    images: {
        upload: (
            data:
                | FormData
                | {
                    file: string;
                    ref?: string;
                    purpose?: "image" | "profile_image" | "icon";
                },
        ) => Promise<Image>;
    };
    media: {
        upload: (data: FormData | { file: string; thumbnail?: string; purpose?: string }) => Promise<any>;
    };
    files: {
        upload: (data: FormData | { file: string; ref?: string }) => Promise<any>;
    };
    config: { read: () => Promise<any> };
    site: { read: () => Promise<Site> };
    themes: {
        upload: (data: FormData | { file: string }) => Promise<Theme>;
        activate: (name: string) => Promise<any>;
    };
}

declare var GhostAdminAPI: {
    (options: Options): GhostAdmin;
    new(options: Options): GhostAdmin;
};

export = GhostAdminAPI;
