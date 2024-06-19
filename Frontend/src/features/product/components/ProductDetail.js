import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/20/solid';
import { RadioGroup } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid } from 'react-loader-spinner';
import { useParams } from 'react-router-dom';
import { useAlert } from 'react-alert';
import {
  fetchProductByIdAsync,
  selectProductById,
  selectProductListStatus,
} from '../productSlice';
import { addToCartAsync, selectItems } from '../../cart/cartSlice';
import { selectLoggedInUser } from '../../auth/authSlice';

function ProductDetail() {
  const [selectedColor, setSelectedColor] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const dispatch = useDispatch();
  const params = useParams();
  const alert = useAlert();
  const product = useSelector(selectProductById);
  const items = useSelector(selectItems);
  const status = useSelector(selectProductListStatus);

  useEffect(() => {
    dispatch(fetchProductByIdAsync(params.id));
  }, [dispatch, params.id]);

  const handleCart = (e) => {
    e.preventDefault();
    if (!product) return; // Add handling for product not loaded yet

    const itemExistsInCart = items.some((item) => item.product.id === product.id);

    if (!itemExistsInCart) {
      const newItem = {
        product: product.id,
        quantity: 1,
        ...(selectedColor && { color: selectedColor }),
        ...(selectedSize && { size: selectedSize }),
      };
      dispatch(addToCartAsync({ item: newItem, alert }));
    } else {
      alert.error('Item Already added');
    }
  };

  if (status === 'loading' || !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Grid
          height={80}
          width={80}
          color="rgb(79, 70, 229)"
          ariaLabel="grid-loading"
          radius={12.5}
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb">
        <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <li>
            <a href="/" className="mr-2 text-sm font-medium text-gray-900">
              Home
            </a>
          </li>
          <li>
            <svg
              width={16}
              height={20}
              viewBox="0 0 16 20"
              fill="currentColor"
              aria-hidden="true"
              className="h-5 w-4 text-gray-300"
            >
              <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
            </svg>
            <a
              href={product.href}
              aria-current="page"
              className="font-medium text-gray-500 hover:text-gray-600"
            >
              {product.title}
            </a>
          </li>
        </ol>
      </nav>

      {/* Product Images */}
      <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
        {product.images.map((image, index) => (
          <div
            key={index}
            className={`aspect-w-3 aspect-h-${index === 0 ? '4' : '2'} overflow-hidden rounded-lg ${index === 0 ? 'lg:block' : 'hidden lg:grid'
              }`}
          >
            <img
              src={image}
              alt={product.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Product Information */}
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:max-w-7xl lg:grid lg:grid-cols-3 lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {product.title}
          </h1>

          {/* Pricing */}
          <div className="mt-4 flex items-center">
            <p className="text-xl line-through tracking-tight text-gray-900">
              ${product.price}
            </p>
            <p className="ml-4 text-3xl tracking-tight text-gray-900">
              ${(
                product.price -
                (product.price * product.discountPercentage) / 100
              ).toFixed(2)}
            </p>
          </div>

          {/* Reviews */}
          <div className="mt-6 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  className={`h-5 w-5 flex-shrink-0 ${product.rating > index
                    ? 'text-gray-900'
                    : 'text-gray-200'
                    }`}
                  aria-hidden="true"
                />
              ))}
              <p className="sr-only">{product.rating} out of 5 stars</p>
            </div>
          </div>

          {/* Add to Cart Form */}
          <form className="mt-10">
            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900">Color</h3>

                <RadioGroup
                  value={selectedColor}
                  onChange={setSelectedColor}
                  className="mt-4"
                >
                  <RadioGroup.Label className="sr-only">
                    Choose a color
                  </RadioGroup.Label>
                  <div className="flex items-center space-x-3">
                    {product.colors.map((color) => (
                      <RadioGroup.Option
                        key={color.name}
                        value={color}
                        className={({ active, checked }) =>
                          `${color.selectedClass} ${active && checked ? 'ring ring-offset-1' : ''
                          } ${!active && checked ? 'ring-2' : ''
                          } relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none`
                        }
                      >
                        <RadioGroup.Label as="span" className="sr-only">
                          {color.name}
                        </RadioGroup.Label>
                        <span
                          aria-hidden="true"
                          className={`h-8 w-8 rounded-full border border-black border-opacity-10 ${color.class}`}
                        />
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Size</h3>
                  <a
                    href="#"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Size guide
                  </a>
                </div>
                <RadioGroup
                  value={selectedSize}
                  onChange={setSelectedSize}
                  className="mt-4"
                >
                  <RadioGroup.Label className="sr-only">
                    Choose a size
                  </RadioGroup.Label>
                  <div className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4">
                    {product.sizes.map((size) => (
                      <RadioGroup.Option
                        key={size.name}
                        value={size}
                        disabled={!size.inStock}
                        className={({ active }) =>
                          `${size.inStock
                            ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
                            : 'cursor-not-allowed bg-gray-50 text-gray-200'
                          } ${active ? 'ring-2 ring-indigo-500' : ''
                          } group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 sm:py-6`
                        }
                      >
                        {({ active, checked }) => (
                          <>
                            <RadioGroup.Label as="span">
                              {size.name}
                            </RadioGroup.Label>
                            {size.inStock ? (
                              <span
                                className={`pointer-events-none absolute -inset-px rounded-md ${active ? 'border' : 'border-2'
                                  } ${checked ? 'border-indigo-500' : 'border-transparent'
                                  }`}
                                aria-hidden="true"
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                              >
                                <svg
                                  className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                                  viewBox="0 0 100 100"
                                  preserveAspectRatio="none"
                                  stroke="currentColor"
                                >
                                  <line
                                    x1={0}
                                    y1={100}
                                    x2={100}
                                    y2={0}
                                    vectorEffect="non-scaling-stroke"
                                  />
                                </svg>
                              </span>
                            )}
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleCart}
              type="submit"
              className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add to Cart
            </button>
          </form>
        </div>

        {/* Product Details */}
        <aside className="py-10 lg:col-span-1 lg:col-start-3 lg:pb-16 lg:pt-6">
          <div className="mb-10">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <p className="mt-4 text-base text-gray-600">{product.description}</p>
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-medium text-gray-900">Warranty Information</h3>
            <p className="mt-4 text-sm text-gray-600">{product.warrantyInformation}</p>
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-medium text-gray-900">Shipping Information</h3>
            <p className="mt-4 text-sm text-gray-600">{product.shippingInformation}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">Availability</h3>
            <p className="mt-4 text-sm text-gray-600">{product.availabilityStatus}</p>
            <p className="mt-2 text-sm text-gray-500">{product.stock} in stock</p>
          </div>
        </aside>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-10 lg:col-span-3">
            <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
            <div className="mt-4 space-y-4">
              {product.reviews.map((review, index) => (
                <div key={index} className="border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    <StarIcon
                      className="h-5 w-5 flex-shrink-0 text-yellow-400"
                      aria-hidden="true"
                    />
                    <p className="ml-2 text-sm text-gray-500">{review.rating} / 5 stars</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                  <div className="mt-2 flex items-center">
                    <p className="text-sm font-medium text-gray-900">{review.reviewerName}</p>
                    <p className="ml-2 text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
