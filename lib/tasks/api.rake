namespace :api do
  desc "TODO"
  task start: :environment do
    sh "PORT=3000 bundle exec foreman start --procfile=Procfile.dev"
  end

end
