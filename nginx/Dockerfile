# Use lightweight Nginx Alpine image
FROM nginx:1.16.0-alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom config(s) from the repo
COPY default.conf /etc/nginx/conf.d/

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground so Docker keeps it running
CMD ["nginx", "-g", "daemon off;"]