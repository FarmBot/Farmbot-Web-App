FactoryBot.define do
  factory :global_bulletin do
    content do
      "we're now accepting pre-orders for Genesis XL v1.5!"
    end

    href do
      "https://farm.bot/blogs/news/pre-order-farmbot-genesis-xl-v1-5"
    end
    href_label { "Click here!" }
    slug { Faker::Food.vegetables }
    type { "info" }
  end
end
